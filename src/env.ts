import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => value ?? '';

export const variables = defineEnvVars({
	PUBLIC_UMAMI_SRC: { public: true, static: true, schema: optional },
	PUBLIC_UMAMI_WEBSITE_ID: { public: true, static: true, schema: optional }
});
