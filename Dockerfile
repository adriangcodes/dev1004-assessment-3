# Base Image: node:22-slim
# 
# Uses official Node.js image, version 22, using a lightweight version of Linux
# 'slim' variant means it's Debian-based but stripped down (smaller size)
#   - Good balance of functionality and attack surface
#   - Smaller than 'node:22' (full image), but more flexible than alpine
# Still includes essential build tools (unlike alpine which may require workarounds)
# Maintained by Node.js and Docker Library maintainers — trusted source, stable and secure
FROM node:22-slim

# Set environment
ENV NODE_ENV=development

# Set the working directory
WORKDIR /app

# Copy package*.json and install dependencies first to optimise caching
COPY package*.json ./
RUN npm install

# Copy core app files
COPY index.js auth.js db.js seed.js ./

# Copy app modules
COPY models/ ./models/
COPY routes/ ./routes/

# Run the app
CMD ["npm", "run", "dev"]

# Expose the port the app runs on
EXPOSE 8080