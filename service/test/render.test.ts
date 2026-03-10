import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { renderRoute } from '../src/routes/render';

let app: FastifyInstance;

beforeAll(async () => {
	app = Fastify();
	app.register(renderRoute);
	await app.ready();
});

afterAll(async () => {
	await app.close();
});

describe('POST /render', () => {
	it('renders a simple template with variables', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/render',
			payload: {
				template: '# {{title}}\n\n{{content}}',
				variables: {
					title: 'My Page',
					content: 'Hello world',
				},
			},
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.output).toBe('# My Page\n\nHello world');
	});

	it('renders templates with filters', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/render',
			payload: {
				template: '{{title|upper}}',
				variables: {
					title: 'hello world',
				},
			},
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.output).toBe('HELLO WORLD');
	});

	it('renders templates with conditionals', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/render',
			payload: {
				template: '{% if author %}By {{author}}{% endif %}',
				variables: {
					author: 'Jane',
				},
			},
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.output).toBe('By Jane');
	});

	it('renders templates with for loops', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/render',
			payload: {
				template: '{% for item in items %}- {{item}}\n{% endfor %}',
				variables: {
					items: ['a', 'b', 'c'],
				},
			},
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.output).toContain('- a');
		expect(body.output).toContain('- b');
		expect(body.output).toContain('- c');
	});

	it('accepts pre-wrapped {{}} variable keys', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/render',
			payload: {
				template: '{{title}}',
				variables: {
					'{{title}}': 'Already wrapped',
				},
			},
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.output).toBe('Already wrapped');
	});

	it('returns errors for invalid templates', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/render',
			payload: {
				template: '{% if %}',
				variables: {},
			},
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.errors.length).toBeGreaterThan(0);
	});

	it('returns 400 for missing required fields', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/render',
			payload: { template: '{{title}}' },
		});

		expect(response.statusCode).toBe(400);
	});
});
