import { expect, test, type Page } from '@playwright/test';
import { layerMarkup, readAvatarSvg, uploadConfig } from './avatar';
import { controlLayer, installFetchControl, settle, type LayerControl } from './fetch-control';
import { seedConfig, seededConfig } from './storage';

test.beforeEach(async ({ page }) => {
	await installFetchControl(page);
	await seedConfig(page, seededConfig);
	await page.goto('/');
	await expect.poll(() => readAvatarSvg(page)).toContain(layerMarkup('hair', 0));
	await page.getByRole('tab', { name: 'Hair' }).click();
});

const selectHair = (page: Page, index: number) =>
	page.getByRole('radio', { name: `Select Hair ${index + 1}`, exact: true }).click();

// Waits until the app fetched the layer and holds it, or received the synthesized answer.
async function expectIntercepted(layer: LayerControl, served: number): Promise<void> {
	await expect.poll(layer.stats).toEqual({ intercepted: 1, served });
}

test('a slow earlier hair style never replaces a later one', async ({ page }) => {
	const hairA = await controlLayer(page, 'hair', 1, 'hold');
	await selectHair(page, 1);
	await expectIntercepted(hairA, 0);

	await selectHair(page, 3);
	await expect.poll(() => readAvatarSvg(page)).toContain(layerMarkup('hair', 3));

	await hairA.release();
	await expectIntercepted(hairA, 1);
	await settle(page);
	const avatar = await readAvatarSvg(page);
	expect(avatar).toContain(layerMarkup('hair', 3));
	expect(avatar).not.toContain(layerMarkup('hair', 1));
});

test('a slow render never refills an avatar whose parts were all removed', async ({ page }) => {
	const hairA = await controlLayer(page, 'hair', 1, 'hold');
	await selectHair(page, 1);
	await expectIntercepted(hairA, 0);

	const noItems = Object.fromEntries(Object.keys(seededConfig.items).map((id) => [id, null]));
	await uploadConfig(page, { ...seededConfig, items: noItems });
	await expect.poll(() => readAvatarSvg(page)).toBe('');

	await hairA.release();
	await expectIntercepted(hairA, 1);
	await settle(page);
	expect(await readAvatarSvg(page)).toBe('');
});

const brokenLayers = [
	{ name: 'a layer that fails to load', action: 'fail' },
	{ name: 'a layer that is not an SVG', action: 'malformed' },
	{ name: 'an HTML page that embeds the layer', action: 'html' }
] as const;

for (const { name, action } of brokenLayers) {
	test(`${name} keeps the previous avatar`, async ({ page }) => {
		const before = await readAvatarSvg(page);
		const hairB = await controlLayer(page, 'hair', 1, action);

		await selectHair(page, 1);
		await expectIntercepted(hairB, 1);
		await settle(page);

		expect(await readAvatarSvg(page)).toBe(before);
	});
}
