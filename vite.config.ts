import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			preprocess: vitePreprocess(),
			// Fully prerendered; 404.html renders unknown paths client-side
			adapter: adapter({ fallback: '404.html' }),
			// Keeps `$lib` imports working so components published via jsrepo stay unchanged
			alias: { $lib: 'src/lib' }
		})
	]
});
