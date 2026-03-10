import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { extractRoute } from '../src/routes/extract';

let app: FastifyInstance;

beforeAll(async () => {
	app = Fastify();
	app.register(extractRoute);
	await app.ready();
});

afterAll(async () => {
	await app.close();
});

const SAMPLE_HTML = `
<!DOCTYPE html>
<html>
<head>
	<title>Test Article</title>
	<meta name="author" content="John Doe">
	<meta name="description" content="A test article for extraction">
</head>
<body>
	<article>
		<h1>Test Article</h1>
		<p>This is the first paragraph of a test article that has enough content to be extracted by Defuddle.</p>
		<p>Here is another paragraph with some <strong>bold text</strong> and <em>italic text</em> to make the content more substantial.</p>
		<p>And a third paragraph to ensure there is enough content for the extraction algorithm to identify this as the main content of the page.</p>
	</article>
</body>
</html>
`;

describe('POST /extract', () => {
	it('extracts content and metadata from a full HTML page', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/extract',
			payload: {
				html: SAMPLE_HTML,
				url: 'https://example.com/article',
			},
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.markdown).toBeDefined();
		expect(body.title).toBeDefined();
	});

	it('returns markdown content', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/extract',
			payload: {
				html: SAMPLE_HTML,
				url: 'https://example.com/article',
			},
		});

		const body = response.json();
		expect(typeof body.markdown).toBe('string');
	});

	it('returns 400 for missing required fields', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/extract',
			payload: { url: 'https://example.com' },
		});

		expect(response.statusCode).toBe(400);
	});
});
