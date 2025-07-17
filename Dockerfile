FROM node:22-slim

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies first
COPY package*.json ./
RUN npm install

# Copy all other app files
COPY . .

# Run the app
CMD ["npm", "run", "dev"]

# Expose the port the app runs on
EXPOSE 8080