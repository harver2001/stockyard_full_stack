from flask import Blueprint, request, jsonify
from flask_limiter import Limiter
from .utils import hash_password, check_password, generate_token, verify_token
import datetime
import os
import psycopg
from psycopg_pool import ConnectionPool
from psycopg.rows import dict_row

# Database connection pool setup
db_uri = os.environ.get('SQLALCHEMY_DATABASE_URI')
pool = ConnectionPool(conninfo=db_uri)

redis_host = os.environ.get('REDIS_HOST', 'localhost')
redis_port = os.environ.get('REDIS_PORT', 6379)
redis_url = f"redis://{redis_host}:{redis_port}"

auth_bp = Blueprint('auth', __name__)

limiter = Limiter(key_func=lambda: request.remote_addr, storage_uri=redis_url)


@auth_bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.get_json()
    if not data or not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({'error': 'Missing required fields'}), 400

    username = data['username']
    email = data['email']
    password = data['password']

    with pool.connection() as conn:
        with conn.cursor() as cur:
            # Check if user already exists
            cur.execute(
                'SELECT id FROM "user" WHERE username = %s OR email = %s',
                (username, email)
            )
            if cur.fetchone():
                return jsonify({'error': 'Username or email already exists'}), 409

            # Register new user
            hashed_password = hash_password(password)
            cur.execute(
                'INSERT INTO "user" (username, email, password_hash, created_at, is_active) VALUES (%s, %s, %s, %s, %s)',
                (username, email, hashed_password, datetime.datetime.utcnow(), True)
            )
            conn.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per hour")
def login():
    data = request.get_json()
    if not data or not all(k in data for k in ('username_or_email', 'password')):
        return jsonify({'error': 'Missing required fields'}), 400

    username_or_email = data['username_or_email']
    password = data['password']

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                'SELECT id, password_hash, is_active FROM "user" WHERE username = %s OR email = %s',
                (username_or_email, username_or_email)
            )
            user = cur.fetchone()

    if not user or not check_password(password, user['password_hash']) or not user['is_active']:
        return jsonify({'error': 'Invalid credentials'}), 401

    access_token = generate_token(user['id'], expires_in=24*3600)  # 1 day
    refresh_token = generate_token(user['id'], expires_in=604800)  # 7 days

    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'expires_in': 24*3600
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Missing or invalid token'}), 401

    refresh_token = auth_header.split(' ')[1]
    payload = verify_token(refresh_token)
    if not payload:
        return jsonify({'error': 'Invalid or expired refresh token'}), 401

    # Issue new access token
    new_access_token = generate_token(payload['user_id'], expires_in=24*3600)
    return jsonify({
        'access_token': new_access_token,
        'expires_in': 24*3600
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Missing or invalid token'}), 401

    token = auth_header.split(' ')[1]
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'Invalid token'}), 401

    # Blacklist the token
    expires_at = datetime.datetime.fromtimestamp(payload['exp'])
    
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO token_blacklist (token, expires_at, blacklisted_at) VALUES (%s, %s, %s)',
                (token, expires_at, datetime.datetime.utcnow())
            )
            conn.commit()

    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.route('/verify', methods=['POST'])
def verify():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'valid': False, 'error': 'Missing token'}), 401

    token = auth_header.split(' ')[1]
    payload = verify_token(token)
    if not payload:
        return jsonify({'valid': False, 'error': 'Invalid or expired token'}), 401

    # Check if token is blacklisted
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT 1 FROM token_blacklist WHERE token = %s', (token,))
            if cur.fetchone():
                return jsonify({'valid': False, 'error': 'Token blacklisted'}), 401

    return jsonify({'valid': True, 'user_id': payload['user_id']}), 200