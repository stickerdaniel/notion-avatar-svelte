import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			preprocess: vitePreprocess(),
			adapter: adapter({
				runtime: 'nodejs22.x'
			}),
			// Keeps `$lib` imports working so components published via jsrepo stay unchanged
			alias: { $lib: 'src/lib' }
		})
	]
});
