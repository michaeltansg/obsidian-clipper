import { FastifyInstance } from 'fastify';
import { render, RenderContext } from '../../../src/utils/renderer';

interface RenderBody {
	template: string;
	variables: Record<string, any>;
	url?: string;
}

export async function renderRoute(app: FastifyInstance) {
	app.post<{ Body: RenderBody }>('/render', {
		schema: {
			body: {
				type: 'object',
				required: ['template', 'variables'],
				properties: {
					template: { type: 'string' },
					variables: { type: 'object' },
					url: { type: 'string' },
				},
			},
		},
	}, async (request, reply) => {
		const { template, variables, url } = request.body;

		try {
			// Wrap variables with {{ }} keys if not already wrapped
			const wrappedVars: Record<string, any> = {};
			for (const [key, value] of Object.entries(variables)) {
				const wrappedKey = key.startsWith('{{') ? key : `{{${key}}}`;
				wrappedVars[wrappedKey] = value;
			}

			const context: RenderContext = {
				variables: wrappedVars,
				currentUrl: url || 'about:blank',
				// No asyncResolver — selector: variables are not supported server-side
			};

			const result = await render(template, context);

			return {
				output: result.output,
				errors: result.errors.map(e => ({ message: e.message })),
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown render error';
			reply.status(500);
			return { error: message };
		}
	});
}
