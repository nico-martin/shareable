# Shareable

Generate beautiful shareable preview images from HTML templates automatically.

> **Note:** This project is heavily influenced by [og:kit](https://ogkit.dev/home). Shareable is an open-source, self-hosted alternative. If you prefer a fully managed hosted solution, check out [og:kit](https://ogkit.dev/home).

## Quick Start

### Local Development

```bash
npm install
npm run dev
```

### Docker

```bash
# Using Docker Compose (recommended)
docker-compose up

# Or build and run manually
docker build -t shareable .
docker run -p 7777:80 shareable
```

Server runs on:
- **Local dev**: `http://localhost:7777`
- **Docker**: `http://localhost:7777` (maps to port 80 in container)

## Configuration

Environment variables (see `.env.example`):
- `PORT` - Server port (default: 7777 local, 80 in Docker)
- `NODE_ENV` - Environment mode (development/production)
- `ALLOWED_HOSTS` - Comma-separated list of allowed URLs/domains to render (e.g., `http://localhost:3000,https://example.com`)
  - Leave empty or set to `*` to allow all hosts (not recommended for production)
  - Only URLs matching these hosts will be rendered
  - Returns `403 Forbidden` for unauthorized hosts

## How to Use

### 1. Add the Template to Your HTML

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Use minified version for production -->
  <script src="https://your-domain.com/library.min.js"></script>
  <!-- Or regular version for development -->
  <!-- <script src="http://localhost:7777/library.js"></script> -->
</head>
<body>
  <!-- Your regular page content -->
  <h1>My Page</h1>
  <p>This content shows normally</p>

  <!-- Shareable Template -->
  <template data-shareable>
    <div style="width: 1200px; height: 630px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white;">
      <h1 style="font-size: 72px;">My Shareable Image</h1>
    </div>
  </template>
</body>
</html>
```

### 2. Generate the Image

```bash
# Generate shareable image from any URL
curl "https://your-domain.com/render?url=https://yoursite.com/page" --output preview.png
```

That's it! The service will:
- Open the URL with `#render-shareable` hash appended
- Extract the `<template data-shareable>` content
- Render it at 1200x630px
- Return a PNG screenshot

## API

### `GET /library.js`

Returns the client-side JavaScript library (unminified).

**Response:** JavaScript code
**Cache-Control:** 1 hour

### `GET /library.min.js`

Returns the minified version of the client-side library (recommended for production).

**Response:** Minified JavaScript code
**Cache-Control:** 1 hour

### `GET /render`

**Parameters:**
- `url` - The page URL to render
- `rebuild` - (optional) Set to `true` to bypass cache

**Response:**
- `200` - PNG image (1200x630px)
- `403` - Forbidden (URL host not in allowed hosts list)
- `404` - Template not found (page has no `<template data-shareable>`)
- `500` - Server error

**Examples:**
```bash
# First request - generates and caches
curl "https://your-domain.com/render?url=https://example.com" -o preview.png

# Second request - instant (from cache)
curl "https://your-domain.com/render?url=https://example.com" -o preview.png

# Force regenerate
curl "https://your-domain.com/render?url=https://example.com&rebuild=true" -o preview.png
```

## Caching

- Screenshots are cached in `.cache/` directory
- Cache key is MD5 hash of the URL
- Check `X-Cache` header: `HIT` = cached, `MISS` = new
- Use `?rebuild=true` to force regeneration

## Development

```bash
npm run dev   # Auto-reload on changes
npm run build # Compile TypeScript
npm start     # Run production build
```

## Example

See `example.html` for a working demo:

```bash
npm run dev
# Open http://localhost:7777/example.html in browser
# Add #render-shareable to URL to see template-only view
# Or generate: curl "http://localhost:7777/render?url=http://localhost:7777/example.html" -o test.png
```

## Deployment

### Docker Compose

The service is ready for docker-compose deployments:

```yaml
# docker-compose.yml
version: '3.8'

services:
  shareable:
    build: .
    ports:
      - "7777:80"  # Host:Container
    environment:
      - PORT=80
    volumes:
      - ./cache:/app/.cache
    restart: unless-stopped
```

Run with: `docker-compose up -d`

## Project Structure

```
src/
  ├── routes/
  │   ├── library.ts    # Library.js endpoints (regular & minified)
  │   ├── render.ts     # Screenshot generation endpoint
  │   └── health.ts     # Health check endpoint
  ├── utils/
  │   └── cache.ts      # Cache management utilities
  ├── public/
  │   └── library.js    # Client-side shareable template renderer
  └── server.ts         # Main Express application
```

## Tips

- Template size should be 1200x630px (standard OG image size)
- Use inline styles in the template (external CSS won't load)
- Test with `#render-shareable` hash in browser before generating
- Keep templates simple for faster rendering
