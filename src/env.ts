import { defineEnvVars } from '@sveltejs/kit/env';

// Public env vars read at runtime by @lukulent/svelte-umami (see .env.example).
// Both are optional; Umami stays disabled when they are unset.
const optional = (value: string | undefined) => value ?? '';

export const variables = defineEnvVars({
	PUBLIC_UMAMI_SRC: { public: true, schema: optional },
	PUBLIC_UMAMI_WEBSITE_ID: { public: true, schema: optional }
});
