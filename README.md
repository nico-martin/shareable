# Shareable

Generate beautiful shareable preview images from HTML templates automatically.

- **Framework Agnostic** - Works with React, Vue, vanilla HTML, WordPress, or any CMS/framework - SPA or MPA
- **Self-Hosted** - Full control over your data and infrastructure, no third-party dependencies
- **Zero Page Weight** - Templates are hidden from visitors, no impact on your site's performance
- **Dynamic Content** - Generate unique images per page with custom fonts, layouts, and real-time data
- **Built-in Caching** - Smart caching system ensures fast response times and reduces server load
- **Multiple Formats** - Supports both Open Graph (1200x630) and Twitter Card (1200x628) formats
- **Simple Integration** - Just add a `<template data-shareable>` tag and include a single script
- **Docker Ready** - Easy deployment with included Docker and docker-compose configurations

> **Note:** This project is heavily influenced by [og:kit](https://ogkit.dev/home). Shareable is an open-source, self-hosted alternative. If you prefer a fully managed hosted solution, check out [og:kit](https://ogkit.dev/home).

## Example

Here's a real-world example using an instance of Shareable running on [shareable.nico.dev](https://shareable.nico.dev/) to generate preview images for [nico.dev](https://nico.dev).

### Generated Image

The service generates this preview image automatically:

![OG Image for nico.dev](http://shareable.nico.dev/render?url=https://nico.dev)

**Image URL:** [http://shareable.nico.dev/render?url=https://nico.dev](http://shareable.nico.dev/render?url=https://nico.dev)

### Template Preview

You can view the template that generates this image by visiting the page with the `#render-shareable` hash:

**Template URL:** [https://nico.dev/#render-shareable](https://nico.dev/#render-shareable)

> **Tip:** Resize your browser to 1200x630px to see exactly what the generated image will look like.

### Implementation Details

nico.dev is a React application. The shareable template is implemented as a React component, but Shareable works with any HTML. It simply extracts and renders the `<template data-shareable>` element from the DOM.

**View the implementation:** [ShareableTemplate.tsx](https://github.com/nico-martin/nico.dev/blob/main/components/ShareableTemplate.tsx)

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
docker run -p 3000:80 shareable
```

Server runs on:
- **Local dev**: `http://localhost:3000` (default: 3000)
- **Docker**: `http://localhost:3000` (maps to port 80 in container)

## Configuration

Environment variables (see `.env.example`):
- `PORT` - Server port (default: 3000 local, 80 in Docker)
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
  <!-- <script src="http://localhost:3000/library.js"></script> -->
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

### 2. Add Meta Tags to Your Page

Use the render endpoint in your meta tags:

```html
<head>
  <!-- Open Graph (Facebook, LinkedIn) -->
  <meta property="og:image" content="https://your-domain.com/render?url=https://yoursite.com/page" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://your-domain.com/render?url=https://yoursite.com/page&format=twitter" />
</head>
```

That's it! The service will:
- Open the URL with `#render-shareable` hash appended
- Extract the `<template data-shareable>` content
- Render it at the correct dimensions (1200x630 for OG, 1200x628 for Twitter)
- Return a PNG screenshot
- Cache it for subsequent requests

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
- `format` - (optional) Image format: `og` (1200x630) or `twitter` (1200x628). Default: `og`
- `version` - (optional) Version string to include in cache key. Changing this value will force a new image to be generated. Useful for cache busting when updating templates
- `rebuild` - (optional) Set to `true` to bypass cache
- `skipTemplateCheck` - (optional) Set to `true` to skip template validation (useful for development/testing)

**Response:**
- `200` - PNG image (dimensions based on format)
- `403` - Forbidden (URL host not in allowed hosts list)
- `404` - Template not found (page has no `<template data-shareable>`)
- `500` - Server error

**Examples:**

```html
<!-- Open Graph (Facebook, LinkedIn) - 1200x630px -->
<head>
  <meta property="og:image" content="https://your-domain.com/render?url=https://yoursite.com/page" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
</head>

<!-- Twitter Large Card - 1200x628px -->
<head>
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://your-domain.com/render?url=https://yoursite.com/page&format=twitter" />
</head>

<!-- Complete example with all meta tags -->
<head>
  <!-- Open Graph -->
  <meta property="og:title" content="Your Page Title" />
  <meta property="og:description" content="Your page description" />
  <meta property="og:image" content="https://your-domain.com/render?url=https://yoursite.com/page" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Your Page Title" />
  <meta name="twitter:description" content="Your page description" />
  <meta name="twitter:image" content="https://your-domain.com/render?url=https://yoursite.com/page&format=twitter" />

  <!-- Force regenerate (useful during development) -->
  <!-- <meta property="og:image" content="https://your-domain.com/render?url=https://yoursite.com/page&rebuild=true" /> -->

  <!-- Use version for cache busting (useful when updating templates) -->
  <!-- <meta property="og:image" content="https://your-domain.com/render?url=https://yoursite.com/page&version=v2.1" /> -->
</head>
```

## Caching

- Screenshots are cached in `cache/` directory
- Cache key is MD5 hash of: URL + format + version (if provided)
- Each format (og/twitter) is cached separately
- Each version creates a separate cache entry
- Check `X-Cache` header: `HIT` = cached, `MISS` = new
- Use `?rebuild=true` to force regeneration
- Use `?version=X` to create version-specific caches (e.g., `version=v1.2.0` or `version=2024-01-05`)

## Development

```bash
npm run dev   # Auto-reload on changes
npm run build # Compile TypeScript
npm start     # Run production build
```

## Local Demo

Test Shareable locally with the included `example.html` file:

**1. Start the development server:**
```bash
npm run dev
```

**2. View the example page:**
- **Regular view:** `http://localhost:3000/example.html`
- **Template view:** `http://localhost:3000/example.html#render-shareable`

**3. View generated preview images:**
- **OG format (1200x630):** `http://localhost:3000/render?url=http://localhost:3000/example.html`
- **Twitter format (1200x628):** `http://localhost:3000/render?url=http://localhost:3000/example.html&format=twitter`

**4. Test cache behavior:**
- Add `&rebuild=true` to force regeneration
- Check the `X-Cache` header: `HIT` (cached) or `MISS` (newly generated)

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
      - "3000:80"  # Host:Container (set PORT env var or uses default 3000)
    environment:
      - PORT=80
    volumes:
      - ./cache:/app/.cache
    restart: unless-stopped
```

Run with: `docker-compose up -d`
