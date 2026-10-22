import { readdirSync, readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';

// hold: answer only after release(). fail: answer the layer's own SVG with HTTP 404.
// malformed: answer 200 without an <svg>. html: answer 200 with an HTML page that embeds an <svg>.
type LayerAction = 'hold' | 'fail' | 'malformed' | 'html';

type LayerRule = {
	action: LayerAction;
	// Every fetch argument whose response carried the layer, as a URL string
	urls: string[];
	// Responses handed back to the app, after any hold
	served: number;
	released: Promise<void>;
	release: () => void;
};

declare global {
	interface Window {
		__fetchControl?: {
			rules: Record<string, LayerRule>;
			control: (marker: string, action: LayerAction) => void;
		};
	}
}

const previewDir = new URL(
	'../src/lib/components/ui/avatar-editor/assets/preview/',
	import.meta.url
);

// The <title> of a layer's SVG. Layers are mostly inlined as data: URLs, so the wrapper recognises
// a layer by this marker in the response body rather than by its URL.
function layerTitle(category: string, index: number): string {
	const read = (file: string) => readFileSync(new URL(file, previewDir), 'utf8');
	const title = read(`${category}/${index}.svg`).match(/<title>[^<]*<\/title>/)?.[0];
	if (!title) throw new Error(`${category} layer ${index} has no <title> to recognise it by`);
	const files = readdirSync(previewDir, { recursive: true, encoding: 'utf8' });
	const owners = files.filter((file) => file.endsWith('.svg') && read(file).includes(title));
	if (owners.length !== 1) throw new Error(`${title} is not unique: ${owners.join(', ')}`);
	return title;
}

// Wraps window.fetch before the app loads, so tests can hold or break single avatar layers.
export async function installFetchControl(page: Page): Promise<void> {
	await page.addInitScript(() => {
		const realFetch = window.fetch.bind(window);
		const rules: Record<string, LayerRule> = {};

		window.__fetchControl = {
			rules,
			control(marker, action) {
				let release = () => {};
				const released = new Promise<void>((resolve) => (release = resolve));
				rules[marker] = { action, urls: [], served: 0, released, release };
			}
		};

		window.fetch = async (input, init) => {
			const url = input instanceof Request ? input.url : String(input);
			const response = await realFetch(input, init);
			const markers = Object.keys(rules);
			if (markers.length === 0) return response;

			const body = await response.clone().text();
			const marker = markers.find((candidate) => body.includes(candidate));
			if (!marker) return response;

			const rule = rules[marker];
			rule.urls.push(url);
			if (rule.action === 'hold') await rule.released;
			rule.served++;
			if (rule.action === 'fail') return new Response(body, { status: 404 });
			if (rule.action === 'malformed') return new Response('<g>no svg root</g>', { status: 200 });
			if (rule.action === 'html') {
				return new Response(`<!doctype html><html><body>${body}</body></html>`, {
					status: 200,
					headers: { 'Content-Type': 'text/html' }
				});
			}
			return response;
		};
	});
}

export type LayerControl = {
	// How often the app fetched the layer, and how many answers it received
	stats: () => Promise<{ intercepted: number; served: number }>;
	release: () => Promise<void>;
};

// Applies `action` to every later fetch whose response is the given avatar layer.
export async function controlLayer(
	page: Page,
	category: string,
	index: number,
	action: LayerAction
): Promise<LayerControl> {
	const marker = layerTitle(category, index);
	await page.evaluate(
		([marker, action]) => {
			if (!window.__fetchControl) throw new Error('installFetchControl did not run');
			window.__fetchControl.control(marker, action);
		},
		[marker, action] as const
	);
	return {
		stats: () =>
			page.evaluate((marker) => {
				const rule = window.__fetchControl?.rules[marker];
				if (!rule) throw new Error(`${marker} is not controlled`);
				return { intercepted: rule.urls.length, served: rule.served };
			}, marker),
		release: () => page.evaluate((marker) => window.__fetchControl?.rules[marker].release(), marker)
	};
}

// Lets the app finish handling the answers it already received, including two rendered frames.
export async function settle(page: Page): Promise<void> {
	await page.evaluate(
		() =>
			new Promise<void>((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
			)
	);
}
