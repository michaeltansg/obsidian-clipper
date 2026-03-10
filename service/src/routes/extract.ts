import { FastifyInstance } from 'fastify';
import { JSDOM } from 'jsdom';
import { createMarkdownContent } from '../../../src/utils/markdown-converter';

interface ExtractBody {
	html: string;
	url: string;
}

export async function extractRoute(app: FastifyInstance) {
	app.post<{ Body: ExtractBody }>('/extract', {
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
			const dom = new JSDOM(html, { url });
			const document = dom.window.document;

			// Dynamically import Defuddle (it expects a Document)
			const { default: Defuddle } = await import('defuddle');
			const extracted = new Defuddle(document as any, { url }).parse();

			const markdown = createMarkdownContent(extracted.content, url);

			return {
				markdown,
				title: extracted.title || '',
				author: extracted.author || '',
				description: extracted.description || '',
				site: extracted.site || '',
				published: extracted.published || '',
				image: extracted.image || '',
				favicon: extracted.favicon || '',
				wordCount: extracted.wordCount || 0,
				schemaOrgData: extracted.schemaOrgData || null,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown extraction error';
			reply.status(500);
			return { error: message };
		}
	});
}
