# Temporary single-stage Dockerfile for multiple backend services (Python-based)
FROM python:3.11-slim

# Set working directory for the application
WORKDIR /app

# Copy Python dependencies files from different services
COPY backend/requirements.txt ./backend/requirements.txt
COPY backend/auth_service/requirements.txt ./backend/auth_service/requirements.txt
COPY backend/stock_service/requirements.txt ./backend/stock_service/requirements.txt

# Install Python dependencies without caching to reduce image size
# Combine requirements from all services
RUN pip install --no-cache-dir -r backend/requirements.txt -r backend/auth_service/requirements.txt -r backend/stock_service/requirements.txt

# Copy the backend application code
COPY backend/ ./backend/

# Copy the start script
COPY start.sh ./start.sh
RUN chmod +x start.sh

# Expose ports for multiple services
EXPOSE 5000 5001 5002

# Command to run multiple services
CMD ["./start.sh"]
