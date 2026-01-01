# Use Puppeteer base image which includes Chrome and all dependencies
FROM ghcr.io/puppeteer/puppeteer:24.1.0

# Set working directory
WORKDIR /app

# Set Puppeteer cache directory
ENV PUPPETEER_CACHE_DIR=/home/pptruser/.cache/puppeteer

# Copy package files
COPY package*.json ./

# Install dependencies as root
USER root
RUN npm ci --only=production

# Install TypeScript and dev dependencies for build
RUN npm install --save-dev typescript @types/node @types/express

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Create cache directory and install Chrome
RUN mkdir -p /home/pptruser/.cache/puppeteer /app/.cache
RUN chown -R pptruser:pptruser /home/pptruser/.cache /app/.cache

# Switch to pptruser to install Chrome
USER pptruser
RUN npx puppeteer browsers install chrome

# Switch back to root to set final permissions
USER root
RUN chown -R pptruser:pptruser /app

# Switch to non-root user for running the app
USER pptruser

# Expose port
EXPOSE 80

# Set default environment variables
ENV PORT=80
ENV NODE_ENV=production

# Run the app
CMD ["node", "dist/server.js"]
