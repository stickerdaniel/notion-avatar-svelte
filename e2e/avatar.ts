import { readFileSync } from 'node:fs';
import { expect, type Page } from '@playwright/test';

function normalizeMarkup(markup: string): string {
	return markup.replace(/>\s+</g, '><').replaceAll('"', "'").replace(/\s+/g, ' ');
}

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

export async function readAvatarSvg(page: Page): Promise<string> {
	const src = await page
		.getByRole('region', { name: 'Avatar Editor' })
		.getByRole('img', { name: /^Avatar for /, includeHidden: true })
		.getAttribute('src');
	const base64 = src?.match(/^data:image\/svg\+xml;base64,(.+)$/)?.[1];
	return base64 ? normalizeMarkup(Buffer.from(base64, 'base64').toString('utf8')) : '';
}

export async function downloadAvatar(
	page: Page,
	variant: string
): Promise<{ filename: string; svg: string }> {
	const download = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Download', exact: true }).click();
	await page.getByRole('menuitem', { name: variant }).click();
	const file = await download;
	const svg = normalizeMarkup(readFileSync(await file.path(), 'utf8'));
	return { filename: file.suggestedFilename(), svg };
}

export async function uploadConfig(
	page: Page,
	config: object,
	name = 'avatar.json'
): Promise<void> {
	const fileChooser = page.waitForEvent('filechooser');
	await page.getByRole('button', { name: 'Upload avatar configuration from JSON file' }).click();
	await (
		await fileChooser
	).setFiles({
		name,
		mimeType: 'application/json',
		buffer: Buffer.from(JSON.stringify(config))
	});
}

export async function downloadConfig(page: Page): Promise<unknown> {
	const download = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Download avatar configuration as JSON file' }).click();
	const path = await (await download).path();
	return JSON.parse(readFileSync(path, 'utf8'));
}

export async function readPreviewConfig(page: Page): Promise<unknown> {
	const preview = page.locator('pre', { hasText: '"lastModified"' });
	await expect(preview.locator('[style*="--shiki-dark"]').first()).toBeVisible();
	return JSON.parse((await preview.textContent()) ?? '');
}
