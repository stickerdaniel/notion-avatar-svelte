declare global {
	namespace App {}

	interface Window {
		umami?: {
			track(event: string, data?: Record<string, string | number | boolean>): void;
		};
	}
}

export {};
