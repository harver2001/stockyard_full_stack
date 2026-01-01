from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv
from .api import stock_bp

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

app.register_blueprint(stock_bp, url_prefix='/api/v1/stock')

@app.route('/')
def home():
    return "Stock Service is running!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=bool(os.environ.get('FLASK_DEBUG')))