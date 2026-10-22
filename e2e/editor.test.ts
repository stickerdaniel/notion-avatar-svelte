import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { STORAGE_KEY, seedConfig, seededConfig, type StoredConfig } from './storage';

// Ignores the whitespace and quote style differences that asset inlining may introduce.
function normalizeMarkup(markup: string): string {
	return markup.replace(/>\s+</g, '><').replaceAll('"', "'").replace(/\s+/g, ' ');
}

// The drawing inside a hair layer's root <svg>, which the editor inlines into the composed avatar.
function hairLayerMarkup(index: number): string {
	const file = new URL(
		`../src/lib/components/ui/avatar-editor/assets/preview/hair/${index}.svg`,
		import.meta.url
	);
	const inner = readFileSync(file, 'utf8')
		.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1]
		.trim();
	if (!inner) throw new Error(`Hair layer ${index} has no <svg> content`);
	return normalizeMarkup(inner);
}

// Runed's PersistedState JSON-encodes the store's config string, so storage holds it twice encoded.
async function readStoredConfig(page: Page): Promise<StoredConfig> {
	return page.evaluate(
		(key) => JSON.parse(JSON.parse(localStorage.getItem(key) ?? '""')),
		STORAGE_KEY
	);
}

async function readAvatarSvg(page: Page): Promise<string> {
	const src = await page
		.getByRole('region', { name: 'Avatar Editor' })
		.getByRole('img', { name: 'Avatar for Ada with blue background' })
		.getAttribute('src');
	const base64 = src?.match(/^data:image\/svg\+xml;base64,(.+)$/)?.[1];
	return base64 ? normalizeMarkup(Buffer.from(base64, 'base64').toString('utf8')) : '';
}

test.beforeEach(async ({ page }) => {
	await seedConfig(page, seededConfig);
});

test('selecting a hair style updates the stored config and avatar, undo restores both', async ({
	page
}) => {
	const noHair = hairLayerMarkup(0);
	const hair3 = hairLayerMarkup(3);

	await page.goto('/');
	await expect.poll(() => readAvatarSvg(page)).toContain(noHair);

	await page.getByRole('tab', { name: 'Hair' }).click();
	await page.getByRole('radio', { name: 'Select Hair 4', exact: true }).click();

	await expect(page.getByRole('radio', { name: 'Select Hair 4', exact: true })).toBeChecked();
	await expect.poll(async () => (await readStoredConfig(page)).items.hair).toBe(3);
	await expect.poll(() => readAvatarSvg(page)).toContain(hair3);
	expect(await readAvatarSvg(page)).not.toContain(noHair);

	await page.getByRole('button', { name: 'Undo', exact: true }).click();

	await expect(page.getByRole('radio', { name: 'Select Hair 1', exact: true })).toBeChecked();
	await expect.poll(() => readStoredConfig(page)).toEqual(seededConfig);
	await expect.poll(() => readAvatarSvg(page)).toContain(noHair);
	expect(await readAvatarSvg(page)).not.toContain(hair3);
});
