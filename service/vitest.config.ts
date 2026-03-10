import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

const srcUtils = resolve(__dirname, '../src/utils');
const shims = resolve(__dirname, 'src/shims');

export default defineConfig({
	define: {
		DEBUG_MODE: false,
	},
	test: {
		include: ['test/**/*.test.ts'],
		globals: true,
		setupFiles: ['./test/setup.ts'],
	},
	resolve: {
		alias: {
			// Redirect browser-only imports to shims (same as esbuild plugin)
			'webextension-polyfill': resolve(shims, 'browser-polyfill.ts'),
		},
	},
	plugins: [
		{
			name: 'shim-browser-imports',
			enforce: 'pre',
			resolveId(source, importer) {
				if (!importer) return null;
				const importerDir = resolve(importer, '..');

				// Only shim imports from src/utils/
				if (!importerDir.startsWith(srcUtils)) return null;

				if (source === './debug' || source === '../debug') {
					return resolve(shims, 'debug.ts');
				}
				if (source === './browser-polyfill' || source === '../browser-polyfill') {
					return resolve(shims, 'browser-polyfill.ts');
				}
				return null;
			},
		},
	],
});
