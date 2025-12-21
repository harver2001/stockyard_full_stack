# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY stock-auth-tester/ ./

# Install dependencies
RUN npm install

# Build the React app
RUN npm run build

# Use an Nginx image to serve the React app
FROM nginx:alpine

# Copy the build output to Nginx's default directory
COPY --from=0 /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]