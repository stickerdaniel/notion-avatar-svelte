import { expect, test } from '@playwright/test';
import { layerMarkup, readAvatarSvg } from './avatar';
import { readStoredConfig, seedConfig, seededConfig } from './storage';

test.beforeEach(async ({ page }) => {
	await seedConfig(page, seededConfig);
});

test('selecting a hair style updates the stored config and avatar, undo restores both', async ({
	page
}) => {
	const noHair = layerMarkup('hair', 0);
	const hair3 = layerMarkup('hair', 3);

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
