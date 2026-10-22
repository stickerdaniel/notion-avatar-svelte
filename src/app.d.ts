// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		// Set by the Umami script, which +layout.svelte loads only when it is configured.
		umami?: {
			track(event: string, data?: Record<string, string | number | boolean>): void;
		};
	}
}

export {};
