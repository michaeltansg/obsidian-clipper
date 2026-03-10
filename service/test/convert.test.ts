import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { convertRoute } from '../src/routes/convert';

let app: FastifyInstance;

beforeAll(async () => {
	app = Fastify();
	app.register(convertRoute);
	await app.ready();
});

afterAll(async () => {
	await app.close();
});

describe('POST /convert', () => {
	it('converts basic HTML to markdown', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/convert',
			payload: {
				html: '<h2>Hello World</h2><p>This is a paragraph.</p>',
				url: 'https://example.com',
			},
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		// Note: createMarkdownContent strips the first H1 (it becomes the note title)
		expect(body.markdown).toContain('Hello World');
		expect(body.markdown).toContain('This is a paragraph.');
	});

	it('converts links with absolute URLs', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/convert',
			payload: {
				html: '<p>Visit <a href="/about">About</a></p>',
				url: 'https://example.com',
			},
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.markdown).toContain('https://example.com/about');
	});

	it('converts bold and italic text', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/convert',
			payload: {
				html: '<p><strong>bold</strong> and <em>italic</em></p>',
				url: 'https://example.com',
			},
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.markdown).toContain('**bold**');
		expect(body.markdown).toContain('*italic*');
	});

	it('converts lists', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/convert',
			payload: {
				html: '<ul><li>Item 1</li><li>Item 2</li></ul>',
				url: 'https://example.com',
			},
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.markdown).toContain('- Item 1');
		expect(body.markdown).toContain('- Item 2');
	});

	it('converts code blocks', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/convert',
			payload: {
				html: '<pre><code class="language-js">const x = 1;</code></pre>',
				url: 'https://example.com',
			},
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.markdown).toContain('```');
		expect(body.markdown).toContain('const x = 1;');
	});

	it('handles empty HTML', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/convert',
			payload: {
				html: '',
				url: 'https://example.com',
			},
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.markdown).toBeDefined();
	});

	it('returns 400 for missing required fields', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/convert',
			payload: { html: '<p>test</p>' },
		});

		expect(response.statusCode).toBe(400);
	});
});
