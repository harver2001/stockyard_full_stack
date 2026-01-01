from flask import Blueprint, request, jsonify
import finnhub
from .utils import verify_token
import os

stock_bp = Blueprint('stock', __name__)

# Initialize Finnhub client
finnhub_client = finnhub.Client(api_key=os.environ.get('FINNHUB_API_KEY'))

@stock_bp.route('/quote/<symbol>', methods=['GET'])
def get_quote(symbol):
    print("Test log!")
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Missing or invalid token'}), 401

    token = auth_header.split(' ')[1]
    token_payload = verify_token(token)
    if not token_payload:
        return jsonify({'error': 'Invalid or expired token'}), 401

    try:
        quote = finnhub_client.quote(symbol.upper())
        return jsonify({
            'symbol': symbol.upper(),
            'current_price': quote['c'],
            'change': quote['d'],
            'percent_change': quote['dp'],
            'high': quote['h'],
            'low': quote['l'],
            'open': quote['o'],
            'previous_close': quote['pc']
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch quote: {str(e)}'}), 500

@stock_bp.route('/company/<symbol>', methods=['GET'])
def get_company(symbol):
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
        return jsonify({'error': f'Failed to fetch company data: {str(e)}'}), 500

@stock_bp.route('/search/<symbol>', methods=['GET'])
def search_stock(symbol):
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
        return jsonify({'error': f'Failed to fetch company data: {str(e)}'}), 500
    