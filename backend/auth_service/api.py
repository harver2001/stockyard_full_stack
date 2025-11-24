from flask import Blueprint, request, jsonify
from flask_limiter import Limiter
from .models import db, User, TokenBlacklist
from .utils import hash_password, check_password, generate_token, verify_token
import datetime

auth_bp = Blueprint('auth', __name__)

limiter = Limiter(key_func=lambda: request.remote_addr)

@auth_bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.get_json()
    if not data or not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({'error': 'Missing required fields'}), 400

    username = data['username']
    email = data['email']
    password = data['password']

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({'error': 'Username or email already exists'}), 409

    hashed_password = hash_password(password)
    new_user = User(username=username, email=email, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per hour")
def login():
    data = request.get_json()
    if not data or not all(k in data for k in ('username_or_email', 'password')):
        return jsonify({'error': 'Missing required fields'}), 400

    username_or_email = data['username_or_email']
    password = data['password']

    user = User.query.filter((User.username == username_or_email) | (User.email == username_or_email)).first()
    if not user or not check_password(password, user.password_hash) or not user.is_active:
        return jsonify({'error': 'Invalid credentials'}), 401

    access_token = generate_token(user.id, expires_in=900)  # 15 minutes
    refresh_token = generate_token(user.id, expires_in=604800)  # 7 days

    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'expires_in': 900
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
    new_access_token = generate_token(payload['user_id'], expires_in=900)
    return jsonify({
        'access_token': new_access_token,
        'expires_in': 900
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
    blacklist_entry = TokenBlacklist(token=token, expires_at=expires_at)
    db.session.add(blacklist_entry)
    db.session.commit()

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
    if TokenBlacklist.query.filter_by(token=token).first():
        return jsonify({'valid': False, 'error': 'Token blacklisted'}), 401

    return jsonify({'valid': True, 'user_id': payload['user_id']}), 200