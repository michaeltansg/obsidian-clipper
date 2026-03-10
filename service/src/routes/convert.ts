import { FastifyInstance } from 'fastify';
import { createMarkdownContent } from '../../../src/utils/markdown-converter';

interface ConvertBody {
	html: string;
	url: string;
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
			const markdown = createMarkdownContent(html, url);
			return { markdown };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown conversion error';
			reply.status(500);
			return { error: message };
		}
	});
}
