from flask import Flask
import os
from dotenv import load_dotenv
from .api import stock_bp

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

app.register_blueprint(stock_bp, url_prefix='/api/v1/stock')

@app.route('/')
def home():
    return "Stock Service is running!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=False)