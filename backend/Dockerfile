FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with lockfile
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]