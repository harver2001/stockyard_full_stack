import jwt
import os

def verify_token(token, secret_key=None):
    if not secret_key:
        secret_key = os.environ.get('SECRET_KEY', 'your-secret-key-change-this-in-production')
    try:
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None