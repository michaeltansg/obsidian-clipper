# Obsidian Clipper Service

A containerized web service that exposes the Obsidian Web Clipper's HTML-to-Markdown conversion pipeline as HTTP endpoints.

## API Reference

### `GET /health`
Health check.

**Response:** `{ "status": "ok" }`

### `POST /convert`
Convert raw HTML to Markdown using Turndown with 40+ custom rules.

**Request:**
```json
{ "html": "<h1>Title</h1><p>Content</p>", "url": "https://example.com" }
```

**Response:**
```json
{ "markdown": "# Title\n\nContent" }
```

### `POST /extract`
Full pipeline: extract article content (via Defuddle) from a complete HTML page, then convert to Markdown.

**Request:**
```json
{ "html": "<!DOCTYPE html><html>...</html>", "url": "https://example.com/article" }
```

**Response:**
```json
{
  "markdown": "# Article Title\n\nArticle content...",
  "title": "Article Title",
  "author": "Author Name",
  "description": "Article description",
  "site": "Example",
  "published": "2024-01-01",
  "image": "https://example.com/image.jpg",
  "favicon": "https://example.com/favicon.ico",
  "wordCount": 500,
  "schemaOrgData": null
}
```

### `POST /render`
Render a template string with variables using the Obsidian Clipper template engine.

**Request:**
```json
{
  "template": "# {{title|upper}}\n\n{{content}}",
  "variables": { "title": "my page", "content": "Hello world" },
  "url": "https://example.com"
}
```

**Response:**
```json
{ "output": "# MY PAGE\n\nHello world", "errors": [] }
```

**Note:** `selector:` variables are not supported server-side (they require a browser tab).

## Development

### Prerequisites
- Node.js 20+
- npm

### Local Setup
```bash
cd service
npm install
npm run build
npm start
```

The server starts on `http://localhost:3000` by default. Configure with `PORT` and `HOST` environment variables.

### Dev Mode
```bash
npm run dev
```

### Running Tests
```bash
# Service integration tests only
npm test

# Both upstream + service tests (run after rebasing)
npm run test:rebase
```

## Docker

### Build
From the repository root:
```bash
docker build -t obsidian-clipper-service -f service/Dockerfile .
```

### Run
```bash
docker run -p 3000:3000 obsidian-clipper-service
```

### Docker Compose
From the `service/` directory:
```bash
docker compose up
```

Or from the repository root:
```bash
docker compose -f service/docker-compose.yml up
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `HOST` | `0.0.0.0` | Server bind address |
| `DEBUG` | `false` | Enable debug logging |

## Architecture

The service reuses the conversion pipeline from `src/utils/` without modifying any upstream files:

- **DOM polyfill:** jsdom provides `DOMParser`, `XMLSerializer`, and HTML element constructors (jsdom is used over linkedom because it provides correct `instanceof` checks for element-specific types like `HTMLTableElement`, `HTMLOListElement`, etc.)
- **Shims:** `debug.ts` and `browser-polyfill.ts` replace browser-only imports with Node.js equivalents
- **esbuild:** Bundles service code with shared `src/utils/`, using a plugin to redirect browser imports to shims

### Post-Rebase Checklist

After rebasing against upstream:
1. `npm test` (from repo root) — verify upstream tests pass
2. `cd service && npm run build` — verify the build succeeds (catches renamed/moved files)
3. `cd service && npm test` — verify service tests pass
4. Or simply: `cd service && npm run test:rebase` (runs both)
