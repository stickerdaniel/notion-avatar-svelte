import { expect, test, type Page } from '@playwright/test';
import { layerMarkup, readAvatarSvg, uploadConfig } from './avatar';
import { readStoredConfig, seedConfig, seededConfig } from './storage';

test.beforeEach(async ({ page }) => {
	await seedConfig(page, seededConfig);
});

const hairRadio = (page: Page, index: number) =>
	page.getByRole('radio', { name: `Select Hair ${index + 1}`, exact: true });

test('selecting a hair style updates the stored config and avatar, undo restores both', async ({
	page
}) => {
	const noHair = layerMarkup('hair', 0);
	const hair3 = layerMarkup('hair', 3);

	await page.goto('/');
	await expect.poll(() => readAvatarSvg(page)).toContain(noHair);

	await page.getByRole('tab', { name: 'Hair' }).click();
	await hairRadio(page, 3).click();

	await expect(hairRadio(page, 3)).toBeChecked();
	await expect.poll(async () => (await readStoredConfig(page)).items.hair).toBe(3);
	await expect.poll(() => readAvatarSvg(page)).toContain(hair3);
	expect(await readAvatarSvg(page)).not.toContain(noHair);

	await page.getByRole('button', { name: 'Undo', exact: true }).click();

	await expect(hairRadio(page, 0)).toBeChecked();
	await expect.poll(() => readStoredConfig(page)).toEqual(seededConfig);
	await expect.poll(() => readAvatarSvg(page)).toContain(noHair);
	expect(await readAvatarSvg(page)).not.toContain(hair3);
});

test('arrow keys move the hair selection in the store, the radios and the avatar', async ({
	page
}) => {
	await page.goto('/');
	await expect.poll(() => readAvatarSvg(page)).toContain(layerMarkup('hair', 0));

	await page.getByRole('tab', { name: 'Hair' }).click();
	await hairRadio(page, 0).focus();
	await page.keyboard.press('ArrowRight');

	await expect(hairRadio(page, 1)).toBeChecked();
	await expect(hairRadio(page, 0)).not.toBeChecked();
	await expect.poll(async () => (await readStoredConfig(page)).items.hair).toBe(1);
	await expect.poll(() => readAvatarSvg(page)).toContain(layerMarkup('hair', 1));
	expect(await readAvatarSvg(page)).not.toContain(layerMarkup('hair', 0));
});

test('a config without hair checks no hair radio until Space selects one', async ({ page }) => {
	const hairLayers = Array.from({ length: 59 }, (_, index) => layerMarkup('hair', index));
	const checkedHair = page
		.getByRole('radiogroup', { name: 'Hair items' })
		.getByRole('radio', { checked: true });

	await page.goto('/');
	await expect.poll(() => readAvatarSvg(page)).toContain(layerMarkup('hair', 0));

	await uploadConfig(page, { ...seededConfig, items: { ...seededConfig.items, hair: null } });

	await expect.poll(async () => (await readStoredConfig(page)).items.hair).toBeNull();
	await expect.poll(() => readAvatarSvg(page)).not.toContain(layerMarkup('hair', 0));
	const avatar = await readAvatarSvg(page);
	expect(avatar).toContain(layerMarkup('face', 0));
	expect(hairLayers.filter((layer) => avatar.includes(layer))).toEqual([]);
	await page.getByRole('tab', { name: 'Hair' }).click();
	await expect(checkedHair).toHaveCount(0);

	await hairRadio(page, 2).focus();
	await page.keyboard.press('Space');

	await expect(checkedHair).toHaveCount(1);
	await expect(hairRadio(page, 2)).toBeChecked();
	await expect.poll(async () => (await readStoredConfig(page)).items.hair).toBe(2);
	await expect.poll(() => readAvatarSvg(page)).toContain(layerMarkup('hair', 2));
});
