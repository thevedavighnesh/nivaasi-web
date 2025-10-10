# Use Node.js 20 (Debian-based, not Alpine)
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Clear npm cache and install dependencies
RUN npm cache clean --force
RUN rm -rf node_modules package-lock.json
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 8080

# Set environment variable
ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]
