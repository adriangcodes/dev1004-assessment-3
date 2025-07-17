FROM node:22-slim

# Copy package.json and install dependencies first
COPY package*.json ./
RUN npm install

# Copy all other files
COPY . .

CMD ["npm", "run", "dev"]

EXPOSE 8080