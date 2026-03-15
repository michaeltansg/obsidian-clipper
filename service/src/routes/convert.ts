import { FastifyInstance } from 'fastify';
import { JSDOM } from 'jsdom';
import { createMarkdownContent } from '../../../src/utils/markdown-converter';

interface ConvertBody {
	html: string;
	url: string;
}

function resolveRelativeUrls(html: string, url: string): string {
	const dom = new JSDOM(html, { url });
	const document = dom.window.document;

	for (const el of document.querySelectorAll('[href]')) {
		if ((el as HTMLAnchorElement).href) {
			el.setAttribute('href', (el as HTMLAnchorElement).href);
		}
	}

	for (const el of document.querySelectorAll('[src]')) {
		if ((el as HTMLImageElement).src) {
			el.setAttribute('src', (el as HTMLImageElement).src);
		}
	}

	return document.body.innerHTML;
}

export async function convertRoute(app: FastifyInstance) {
	app.post<{ Body: ConvertBody }>('/convert', {
		schema: {
			body: {
				type: 'object',
				required: ['html', 'url'],
				properties: {
					html: { type: 'string' },
					url: { type: 'string' },
				},
			},
		},
	}, async (request, reply) => {
		const { html, url } = request.body;

		try {
			const resolved = resolveRelativeUrls(html, url);
			const markdown = createMarkdownContent(resolved, url);
			return { markdown };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown conversion error';
			reply.status(500);
			return { error: message };
		}
	});
}
