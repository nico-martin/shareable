# Use Puppeteer base image which includes Chrome and all dependencies
FROM ghcr.io/puppeteer/puppeteer:21.6.1

# Set working directory
WORKDIR /app

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

# Create cache directory
RUN mkdir -p .cache

# Switch to non-root user (pptruser is created by the base image)
RUN chown -R pptruser:pptruser /app
USER pptruser

# Expose port
EXPOSE 80

# Set default environment variables
ENV PORT=80
ENV NODE_ENV=production

# Run the app
CMD ["node", "dist/server.js"]
