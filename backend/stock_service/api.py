from flask import Blueprint, request, jsonify
import finnhub
import yfinance as yf
from .utils import verify_token
import os
import time
import logging
from rapidfuzz import process, fuzz
from .indicators import (
    calculate_rsi,
    calculate_macd,
    calculate_ema,
    calculate_bollinger_bands,
    get_prediction_verdict
)

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

stock_bp = Blueprint('stock', __name__)

# Initialize Finnhub client
finnhub_client = finnhub.Client(api_key=os.environ.get('FINNHUB_API_KEY'))

from .redis_client import redis_client
from .rabbitmq_client import publisher
import json

@stock_bp.route('/quote/<symbol>', methods=['GET'])
def get_quote(symbol):
    symbol = symbol.upper()
    logger.info(f"Fetching quote for symbol: {symbol}")
    
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Missing or invalid token'}), 401

    token = auth_header.split(' ')[1]
    token_payload = verify_token(token)
    if not token_payload:
        return jsonify({'error': 'Invalid or expired token'}), 401

    # Try to get from Redis cache
    r = redis_client.get_client()
    if r:
        try:
            cached_quote = r.get(f"quote:{symbol}")
            if cached_quote:
                logger.info(f"Cache hit for {symbol}")
                return jsonify(json.loads(cached_quote)), 200
        except Exception as e:
            logger.error(f"Redis error: {str(e)}")

    try:
        quote = finnhub_client.quote(symbol)
        quote_data = {
            'symbol': symbol,
            'current_price': quote['c'],
            'change': quote['d'],
            'percent_change': quote['dp'],
            'high': quote['h'],
            'low': quote['l'],
            'open': quote['o'],
            'previous_close': quote['pc']
        }
        
        # Cache in Redis for 60 seconds
        if r:
            try:
                r.setex(f"quote:{symbol}", 60, json.dumps(quote_data))
                logger.info(f"Cached quote for {symbol}")
            except Exception as e:
                logger.error(f"Failed to cache in Redis: {str(e)}")
                
        return jsonify(quote_data), 200
    except Exception as e:
        logger.error(f"Error fetching quote for {symbol}: {str(e)}")
        return jsonify({'error': f'Failed to fetch quote: {str(e)}'}), 500


@stock_bp.route('/company/<symbol>', methods=['GET'])
def get_company(symbol):
    logger.info(f"Fetching company profile for symbol: {symbol}")
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Missing or invalid token'}), 401

    token = auth_header.split(' ')[1]
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'Invalid or expired token'}), 401

    try:
        profile = finnhub_client.company_profile2(symbol=symbol.upper())
        return jsonify(profile), 200
    except Exception as e:
        logger.error(f"Error fetching company data for {symbol}: {str(e)}")
        return jsonify({'error': f'Failed to fetch company data: {str(e)}'}), 500

@stock_bp.route('/search/<symbol>', methods=['GET'])
def search_stock(symbol):
    logger.info(f"Searching for stock: {symbol}")
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Missing or invalid token'}), 401

    token = auth_header.split(' ')[1]
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'Invalid or expired token'}), 401
    
    if symbol is None:
        return jsonify({'error': 'Missing symbol parameter'}), 400
    try:
        result = finnhub_client.symbol_lookup(symbol)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error searching for stock {symbol}: {str(e)}")
        return jsonify({'error': f'Failed to fetch search results: {str(e)}'}), 500
    
@stock_bp.route('/list', methods=['GET'])
def list_stocks():
    try:
        r = redis_client.get_client()
        if r:
            cached = r.get('symbols')
            if cached:
                return jsonify(json.loads(cached)), 200

        symbols = finnhub_client.stock_symbols('US')
        if r:
            try:
                r.setex('symbols', 3600, json.dumps(symbols))
                logger.info(f"Cached {len(symbols)} symbols")
            except Exception as e:
                logger.error(f"Error caching symbols: {str(e)}")
                
        return jsonify(symbols), 200
    except Exception as e:
        logger.error(f"Error listing stocks: {str(e)}")
        return jsonify({'error': f'Failed to fetch symbols: {str(e)}'}), 500

@stock_bp.route('/search-list', methods=['GET'])
def search_list():
    if request.method != 'GET':
        return jsonify({'error': 'Method not allowed'}), 405
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Missing or invalid token'}), 401
    
    token = auth_header.split(' ')[1]
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'Invalid or expired token'}), 401
    
    query = request.args.get('q', '').upper()
    if not query:
        return jsonify([]), 200

    r = redis_client.get_client()
    symbols = []
    
    if r:
        cached_symbols = r.get('symbols')
        if cached_symbols:
            symbols = json.loads(cached_symbols)
    
    # If not in cache or Redis is down, fetch from Finnhub
    if not symbols:
        try:
            symbols = finnhub_client.stock_symbols('US')
            if r:
                r.setex('symbols', 3600, json.dumps(symbols))
        except Exception as e:
            logger.error(f"Error fetching symbols for search: {e}")
            return jsonify({'error': 'Failed to fetch symbols'}), 500

    # Filter symbols by symbol or description
    filtered_list = [
        item for item in symbols 
        if query in item.get('symbol', '').upper() or query in item.get('description', '').upper()
    ]
    
    # Sort: Exact symbol matches first, then prefix matches, then others
    def search_rank(item):
        sym = item.get('symbol', '').upper()
        if sym == query: return 0
        if sym.startswith(query): return 1
        return 2

    filtered_list.sort(key=search_rank)
    
    # Return top 50 results to keep response size manageable
    return jsonify(filtered_list[:50]), 200

@stock_bp.route('/stock-candles', methods=['GET'])
def get_stock_candles():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Missing or invalid token'}), 401
    
    token = auth_header.split(' ')[1]
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'Invalid or expired token'}), 401
    
    symbol = request.args.get('symbol')
    if not symbol:
        return jsonify({'error': 'Missing symbol parameter'}), 400
    
    period = request.args.get('period', '1y')
    interval = request.args.get('interval', '1d')
    
    try:
        symbol = symbol.upper()
        logger.info(f"Fetching candles for {symbol} with period={period} and interval={interval}")
        
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period, interval=interval)
        
        if hist.empty:
            return jsonify({'error': 'No data found for this symbol'}), 404
            
        # Convert index (Dates) to unix timestamps in seconds
        timestamps = [int(t.timestamp()) for t in hist.index]
        
        # Extract closing prices
        close_prices = hist['Close'].tolist()
        
        # Calculate technical indicators
        rsi_list = calculate_rsi(close_prices)
        macd_list, signal_list, hist_list = calculate_macd(close_prices)
        ema20_list = calculate_ema(close_prices, 20)
        ema50_list = calculate_ema(close_prices, 50)
        bb_upper_list, bb_middle_list, bb_lower_list = calculate_bollinger_bands(close_prices)
        
        # Generate prediction verdict
        analysis = get_prediction_verdict(
            rsi_list, macd_list, signal_list, hist_list,
            ema20_list, ema50_list, bb_upper_list, bb_lower_list,
            close_prices
        )
        
        data = {
            't': timestamps,
            'o': hist['Open'].tolist(),
            'h': hist['High'].tolist(),
            'l': hist['Low'].tolist(),
            'c': close_prices,
            'v': hist['Volume'].tolist(),
            'rsi': rsi_list,
            'macd': macd_list,
            'signal': signal_list,
            'histogram': hist_list,
            'ema20': ema20_list,
            'ema50': ema50_list,
            'bb_upper': bb_upper_list,
            'bb_middle': bb_middle_list,
            'bb_lower': bb_lower_list,
            'analysis': analysis,
            's': 'ok'
        }
        
        return jsonify(data), 200
    except Exception as e:
        logger.error(f"Error fetching candles for {symbol}: {e}")
        return jsonify({'error': f'Failed to fetch candles: {str(e)}'}), 500
        
@stock_bp.route('/add-stock', methods=['POST'])
def add_stock():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Missing or invalid token'}), 401
    
    token = auth_header.split(' ')[1]
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'Invalid or expired token'}), 401

    data = request.json
    if not data or 'symbol' not in data:
        return jsonify({'error': 'Missing symbol'}), 400
    
    # Ensure user_id is in the data being published
    if 'user_id' not in data:
        data['user_id'] = payload.get('user_id') or payload.get('sub')
    
    try:
        publisher.publish_stock_added(data)
        return jsonify({'message': f"Stock {data['symbol']} add event published"}), 201
    except Exception as e:
        logger.error(f"Failed to publish stock add event: {str(e)}")
        return jsonify({'error': 'Failed to process stock addition'}), 500
