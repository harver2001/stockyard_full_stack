import jwt
import bcrypt
import datetime
import uuid
import os


def hash_password(password):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_password(password, hashed):
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def generate_token(user_id, expires_in=900, secret_key=None):  # 15 minutes default
    if not secret_key:
        secret_key = os.environ.get("SECRET_KEY", "secret-key")
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=expires_in),
        "iat": datetime.datetime.utcnow(),
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, secret_key, algorithm="HS256")


def verify_token(token, secret_key=None):
    if not secret_key:
        secret_key = os.environ.get("SECRET_KEY", "secret-key")
    try:
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
