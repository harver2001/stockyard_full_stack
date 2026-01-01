# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY stock-auth-tester/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY stock-auth-tester/ ./

# Expose port 3000
EXPOSE 3000

# Start the React app in development mode
CMD ["npm", "start"]