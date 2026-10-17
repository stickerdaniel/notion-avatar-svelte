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

	// Set by Vercel at build time, read in src/routes/+layout.svelte
	interface ImportMetaEnv {
		readonly VITE_VERCEL_OBSERVABILITY_BASEPATH?: string;
		readonly VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG?: string;
	}
}

export {};
