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
RUN chmod -R 777 /app/.cache

# Switch to pptruser to install Chrome
USER pptruser
RUN npx puppeteer browsers install chrome

# Switch back to root to set final permissions
USER root
RUN chown -R pptruser:pptruser /app
RUN chmod -R 777 /app/.cache

# Install gosu for user switching
RUN apt-get update && apt-get install -y gosu && rm -rf /var/lib/apt/lists/*

# Copy and setup entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 80

# Set default environment variables
ENV PORT=80
ENV NODE_ENV=production

# Stay as root for entrypoint, which will switch to pptruser
# Use entrypoint to handle permissions then run as pptruser
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
