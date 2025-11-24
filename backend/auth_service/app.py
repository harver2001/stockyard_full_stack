from flask import Flask
from flask_limiter import Limiter
import os
from dotenv import load_dotenv
from .models import db
from .api import auth_bp, limiter

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('SQLALCHEMY_DATABASE_URI', 'sqlite:///auth.db')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'secret-key')
db.init_app(app)
limiter.init_app(app)

app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')

@app.route('/')
def home():
    return "Auth Service is running!"

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5001, debug=False)