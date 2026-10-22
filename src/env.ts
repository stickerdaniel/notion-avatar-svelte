import { defineEnvVars } from '@sveltejs/kit/env';

// Public build-time env vars that add the Umami script in +layout.svelte (see .env.example).
// Both are optional; Umami stays disabled unless both are set. `static` inlines them at build
// time, which fits the prerendered site and avoids fetching a runtime env module.
const optional = (value: string | undefined) => value ?? '';

export const variables = defineEnvVars({
	PUBLIC_UMAMI_SRC: { public: true, static: true, schema: optional },
	PUBLIC_UMAMI_WEBSITE_ID: { public: true, static: true, schema: optional }
});
