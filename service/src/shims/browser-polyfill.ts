// No-op shim for browser extension APIs (not available in Node.js)
export default {
	runtime: {
		getURL: (path: string) => path,
		sendMessage: async () => ({}),
	},
	storage: {
		local: {
			get: async () => ({}),
			set: async () => {},
		},
		sync: {
			get: async () => ({}),
			set: async () => {},
		},
	},
	tabs: {
		query: async () => [],
		sendMessage: async () => ({}),
	},
	i18n: {
		getMessage: (key: string) => key,
	},
};
