import { readFileSync } from 'node:fs';
import { expect, type Page } from '@playwright/test';

// Ignores the whitespace and quote style differences that asset inlining may introduce.
function normalizeMarkup(markup: string): string {
	return markup.replace(/>\s+</g, '><').replaceAll('"', "'").replace(/\s+/g, ' ');
}

// The drawing inside a layer's root <svg>, which the editor inlines into the composed avatar.
export function layerMarkup(category: string, index: number): string {
	const file = new URL(
		`../src/lib/components/ui/avatar-editor/assets/preview/${category}/${index}.svg`,
		import.meta.url
	);
	const inner = readFileSync(file, 'utf8')
		.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1]
		.trim();
	if (!inner) throw new Error(`${category} layer ${index} has no <svg> content`);
	return normalizeMarkup(inner);
}

// The composed avatar SVG in the editor, or '' while none is rendered.
export async function readAvatarSvg(page: Page): Promise<string> {
	const src = await page
		.getByRole('region', { name: 'Avatar Editor' })
		.getByRole('img', { name: /^Avatar for / })
		.getAttribute('src');
	const base64 = src?.match(/^data:image\/svg\+xml;base64,(.+)$/)?.[1];
	return base64 ? normalizeMarkup(Buffer.from(base64, 'base64').toString('utf8')) : '';
}

export async function uploadConfig(page: Page, config: object): Promise<void> {
	const fileChooser = page.waitForEvent('filechooser');
	await page.getByRole('button', { name: 'Upload avatar configuration from JSON file' }).click();
	await (
		await fileChooser
	).setFiles({
		name: 'avatar.json',
		mimeType: 'application/json',
		buffer: Buffer.from(JSON.stringify(config))
	});
}

// The config the page offers as a JSON file download.
export async function downloadConfig(page: Page): Promise<unknown> {
	const download = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Download avatar configuration as JSON file' }).click();
	const path = await (await download).path();
	return JSON.parse(readFileSync(path, 'utf8'));
}

// The config shown in the avatarStore.configJSON preview. Hydration keeps the prerendered text,
// so this waits for Shiki's output, which renders the client's config.
export async function readPreviewConfig(page: Page): Promise<unknown> {
	const preview = page.locator('pre', { hasText: '"lastModified"' });
	await expect(preview.locator('[style*="--shiki-dark"]').first()).toBeVisible();
	return JSON.parse((await preview.textContent()) ?? '');
}
