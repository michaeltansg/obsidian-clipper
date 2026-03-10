/**
 * DOM polyfill using jsdom.
 * MUST be imported before any module that uses DOM APIs (markdown-converter, filters, etc.).
 *
 * jsdom provides full DOM compatibility including correct instanceof checks
 * for HTMLTableElement, HTMLOListElement, etc.
 *
 * CRITICAL: We must ensure all documents are created within the SAME jsdom window
 * context so that instanceof checks work. jsdom's DOMParser.parseFromString creates
 * documents in a new browsing context with separate constructors, which breaks
 * instanceof. We use document.implementation.createHTMLDocument() instead, which
 * stays in the same window context.
 */
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
const { window } = dom;

/**
 * DOMParser polyfill that creates documents in the same window context
 * as our global constructors, ensuring instanceof checks work correctly.
 */
class DOMParserPolyfill {
	parseFromString(str: string, type: string): Document {
		if (type === 'text/html') {
			const doc = window.document.implementation.createHTMLDocument('');
			doc.open();
			doc.write(str);
			doc.close();
			return doc as unknown as Document;
		}
		// For XML types, use the native DOMParser
		const parser = new window.DOMParser();
		return parser.parseFromString(str, type) as unknown as Document;
	}
}

// Turndown checks `typeof window !== 'undefined'` and if true, uses `window.DOMParser`
// for HTML parsing. If `window` is not set, Turndown CJS falls back to `@mixmark-io/domino`,
// a completely separate DOM implementation whose elements fail `instanceof HTMLElement` checks.
//
// Solution: Set a minimal `window` global that exposes our DOMParser polyfill.
// We can't use jsdom's full window because it throws on `localStorage` for opaque origins.
// Instead, we create a plain object with just the properties Turndown needs.

// Assign DOM globals needed by src/utils/ code
const domGlobals: Record<string, any> = {
	DOMParser: DOMParserPolyfill,
	XMLSerializer: window.XMLSerializer,
	document: window.document,
	Node: window.Node,
	Element: window.Element,
	HTMLElement: window.HTMLElement,
	HTMLTableElement: window.HTMLTableElement,
	HTMLIFrameElement: window.HTMLIFrameElement,
	HTMLOListElement: window.HTMLOListElement,
	HTMLInputElement: window.HTMLInputElement,
	getComputedStyle: window.getComputedStyle.bind(window),
	// Minimal window object for Turndown (avoids jsdom localStorage error)
	window: { DOMParser: DOMParserPolyfill },
};

for (const [key, value] of Object.entries(domGlobals)) {
	try {
		(globalThis as any)[key] = value;
	} catch {
		Object.defineProperty(globalThis, key, { value, writable: true, configurable: true });
	}
}

// navigator may already exist in Node.js 21+
try {
	(globalThis as any).navigator = { platform: 'linux', userAgentData: undefined };
} catch {
	// Already defined and read-only — that's fine
}
