from flask import Blueprint, request, jsonify
import finnhub
from .utils import verify_token
import os
import logging

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

stock_bp = Blueprint('stock', __name__)

# Initialize Finnhub client
finnhub_client = finnhub.Client(api_key=os.environ.get('FINNHUB_API_KEY'))

from .redis_client import redis_client
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
    # logger.info("Listing all US stock symbols")
    # auth_header = request.headers.get('Authorization')
    # if not auth_header or not auth_header.startswith('Bearer '):
    #     return jsonify({'error': 'Missing or invalid token'}), 401

    # token = auth_header.split(' ')[1]
    # payload = verify_token(token)
    # if not payload:
    #     return jsonify({'error': 'Invalid or expired token'}), 401

    try:
        symbols = finnhub_client.stock_symbols('US')
        logger.info(f"Successfully retrieved {len(symbols)} symbols")
        r = redis_client.get_client()
        if r:
            try:
                if r.get('symbols'):
                    symbols = r.get('symbols')
                else:
                    r.setex('symbols', 60, json.dumps(symbols))
                    logger.info(f"Successfully cached {len(symbols)} symbols")
            except Exception as e:
                logger.error(f"Error caching symbols: {str(e)}")
                raise Exception(f"Error caching symbols: {str(e)}")
        return jsonify(symbols), 200
    except Exception as e:
        logger.error(f"Error listing stocks: {str(e)}")
        return jsonify({'error': f'Failed to fetch symbols: {str(e)}'}), 500

@stock_bp.route('/search-list', methods=['GET'])
def search_list():
    query = request.args.get('q', '').upper()
    
    # Sample list for demonstration
    sample_stocks = [
        {'symbol': 'AAPL', 'name': 'Apple Inc.'},
        {'symbol': 'MSFT', 'name': 'Microsoft Corporation'},
        {'symbol': 'GOOGL', 'name': 'Alphabet Inc.'},
        {'symbol': 'AMZN', 'name': 'Amazon.com Inc.'},
        {'symbol': 'TSLA', 'name': 'Tesla Inc.'},
        {'symbol': 'NVDA', 'name': 'NVIDIA Corporation'},
        {'symbol': 'META', 'name': 'Meta Platforms Inc.'},
        {'symbol': 'NFLX', 'name': 'Netflix Inc.'},
        {'symbol': 'ADBE', 'name': 'Adobe Inc.'},
        {'symbol': 'PYPL', 'name': 'PayPal Holdings Inc.'}
    ]
    
    if not query:
        return jsonify(sample_stocks), 200
        
    filtered_list = [
        item for item in sample_stocks 
        if query in item['symbol'] or query in item['name'].upper()
    ]
    
    return jsonify(filtered_list), 200