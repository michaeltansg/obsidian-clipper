// DOM globals MUST be imported before any module that uses DOM APIs
import './dom-globals.js';

import Fastify from 'fastify';
import { healthRoute } from './routes/health.js';
import { convertRoute } from './routes/convert.js';
import { extractRoute } from './routes/extract.js';
import { renderRoute } from './routes/render.js';

const server = Fastify({
	logger: true,
	bodyLimit: 10 * 1024 * 1024, // 10MB to handle large HTML pages
});

server.register(healthRoute);
server.register(convertRoute);
server.register(extractRoute);
server.register(renderRoute);

const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || '0.0.0.0';

server.listen({ port, host }, (err, address) => {
	if (err) {
		server.log.error(err);
		process.exit(1);
	}
	server.log.info(`Obsidian Clipper service listening on ${address}`);
});

export { server };
