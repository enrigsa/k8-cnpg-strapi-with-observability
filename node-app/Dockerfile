# Use Node.js Alpine 22 as the base image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (default Express port is 3000)
EXPOSE 3000

# Command to run the application
CMD ["node", "index.js"]