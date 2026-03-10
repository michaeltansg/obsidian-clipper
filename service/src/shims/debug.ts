const DEBUG_MODE = process.env.DEBUG === 'true';
let debugMode = DEBUG_MODE;

export const toggleDebug = (_filterName: string) => {
	if (!DEBUG_MODE) return;
	debugMode = !debugMode;
	console.log(`Debug mode is now ${debugMode ? 'ON' : 'OFF'}`);
};

export const debugLog = (filterName: string, ...args: any[]) => {
	if (DEBUG_MODE && debugMode) {
		console.log(`[${filterName}]`, ...args);
	}
};

export const isDebugMode = () => DEBUG_MODE && debugMode;
