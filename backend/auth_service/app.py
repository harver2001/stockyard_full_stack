from flask import Flask
from flask_limiter import Limiter
from flask_cors import CORS
import os
from dotenv import load_dotenv
import os

# Load environment variables from .env file before any other imports
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

from .models import db, migrate
from .api import auth_bp, limiter

app = Flask(__name__)
CORS(app, origins=["*"], supports_credentials=True)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('SQLALCHEMY_DATABASE_URI', 'sqlite:///auth.db')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'secret-key')
db.init_app(app)
migrate.init_app(app, db)
limiter.init_app(app)

app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')

@app.route('/')
def home():
    return "Auth Service is running!"

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5001, debug=bool(os.environ.get('FLASK_DEBUG')))