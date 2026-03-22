import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcUtils = resolve(__dirname, '../src/utils');
const shims = resolve(__dirname, 'src/shims');

/**
 * esbuild plugin to redirect browser-only imports to Node.js shims.
 *
 * Intercepts:
 * - ./debug, ../debug → service/src/shims/debug.ts
 * - ./browser-polyfill, ../browser-polyfill → service/src/shims/browser-polyfill.ts
 *
 * Only applies to files inside src/utils/ (the shared extension code).
 */
const shimPlugin = {
	name: 'shim-browser-imports',
	setup(build) {
		// Redirect debug imports from src/utils/ to our shim
		build.onResolve({ filter: /^\.\.?\/debug$/ }, (args) => {
			if (args.resolveDir.startsWith(srcUtils)) {
				return { path: resolve(shims, 'debug.ts') };
			}
		});

		// Redirect browser-polyfill imports from src/utils/ to our shim
		build.onResolve({ filter: /^\.\.?\/browser-polyfill$/ }, (args) => {
			if (args.resolveDir.startsWith(srcUtils)) {
				return { path: resolve(shims, 'browser-polyfill.ts') };
			}
		});
	},
};

await build({
	entryPoints: [resolve(__dirname, 'src/index.ts')],
	bundle: true,
	platform: 'node',
	target: 'node20',
	format: 'esm',
	outdir: resolve(__dirname, 'dist'),
	sourcemap: true,
	plugins: [shimPlugin],
	// Only externalize packages that are pure ESM-compatible and don't need
	// global setup ordering. Turndown must be bundled because it checks
	// `typeof window` at load time, and ESM imports hoist above our dom-globals
	// setup code. Bundling ensures Turndown's init runs after globals are set.
	// Defuddle must also be bundled because its dist files are UMD/CJS, and
	// Node.js ESM cannot extract named exports from CJS modules at runtime.
	external: [
		'fastify',
		'jsdom',
		'dompurify',
	],
	// Define DEBUG_MODE as false (used by debug.ts in src/utils)
	define: {
		'DEBUG_MODE': 'false',
	},
	banner: {
		// Required for ESM compatibility with __dirname/__filename in Node.js
		js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
	},
});

console.log('Build complete: dist/index.js');
