# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Obsidian Web Clipper — an official browser extension for Obsidian that saves and highlights web pages as local Markdown. Supports Chrome, Firefox, and Safari from a single codebase.

## Build & Development Commands

```bash
npm run build              # Build all three browser versions
npm run dev                # Dev watch mode (all browsers)
npm run dev:chrome         # Dev watch mode (Chrome only)
npm run dev:firefox        # Dev watch mode (Firefox only)
npm run dev:safari         # Dev watch mode (Safari only)
npm run build:chrome       # Production build for Chrome
npm run build:firefox      # Production build for Firefox
npm run build:safari       # Production build for Safari
npm test                   # Run tests (Vitest)
npm run test:watch         # Watch mode tests
```

Output directories: `dist/` (Chrome), `dist_firefox/`, `dist_safari/`.

## Code Style

- **Tabs** for indentation (width 4)
- **Single quotes**, semicolons required
- `else` on new line
- TypeScript strict mode enabled

## Architecture

### Extension Entry Points

- `src/background.ts` — Service worker: tab state, context menus, message routing between components
- `src/content.ts` — Content script injected into web pages for highlighting and page interaction
- `src/core/popup.ts` — Popup UI for quick clipping
- `src/core/settings.ts` — Settings page initialization
- `src/side-panel.html` — Side panel UI (modern panel interface)

### Template Engine Pipeline

The clipper has a **custom template engine** — the most architecturally significant subsystem:

**`tokenizer.ts` → `parser.ts` → `renderer.ts`**

- **Tokenizer** (`src/utils/tokenizer.ts`) — Lexical analysis producing tokens with error reporting
- **Parser** (`src/utils/parser.ts`) — Converts tokens into an AST; supports `if/elseif/else/endif`, `for/endfor`, `set` statements
- **Renderer** (`src/utils/renderer.ts`) — Evaluates the AST with variable interpolation and filter application
- **Filters** (`src/utils/filters/`) — 100+ individual filter implementations (string, date, calc, callout, table, etc.)

### Variable System

Variables are resolved by type in `src/utils/variables/`:
- `simple` — Basic lookups (page title, URL, etc.)
- `schema` — JSON-LD/schema.org extraction
- `prompt` — User-provided prompt variables
- `selector` — CSS selector queries on the page

### Key Utilities

- `src/utils/interpreter.ts` — LLM integration supporting multiple providers (Anthropic, OpenAI, Gemini, Ollama, etc.) via OpenAI-compatible API format
- `src/utils/highlighter.ts` — Click-to-highlight system on web pages
- `src/utils/reader.ts` — Reader mode (distraction-free view)
- `src/utils/markdown-converter.ts` — HTML→Markdown conversion using Turndown, with special handling for charts and tables
- `src/utils/filters.ts` — Filter registry and application logic

### Manager Components (`src/managers/`)

UI managers for settings subsections: template CRUD, interpreter/LLM config, property types, general settings.

### Browser Compatibility

Uses `webextension-polyfill` for cross-browser API compatibility. Browser-specific manifests: `manifest.chrome.json`, `manifest.firefox.json`, `manifest.safari.json`.

## Testing

Tests use **Vitest** with globals enabled. Test files live alongside source files as `*.test.ts`. The `webextension-polyfill` module is mocked in tests via `src/utils/__mocks__/webextension-polyfill.ts`.

Run a single test file:
```bash
npx vitest run src/utils/filters/some-filter.test.ts
```

## i18n

34 languages in `src/_locales/{lang}/messages.json`. Helper scripts:
- `npm run update-locales` — Update translations
- `npm run check-strings` — Find unused locale strings
- `npm run add-locale` — Add a new language

## Key Dependencies

- **Defuddle** — Content extraction from web pages
- **Turndown** — HTML to Markdown conversion
- **DOMPurify** — HTML sanitization
- **dayjs** — Date/time manipulation in filters
- **lz-string** — Template compression for storage
