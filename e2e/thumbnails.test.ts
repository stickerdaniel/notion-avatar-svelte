import { expect, test, type Locator } from '@playwright/test';
import { layerMarkup, readAvatarSvg } from './avatar';
import { seedConfig, seededConfig } from './storage';

const HAIR_STYLES = 59;

const filterOf = (image: Locator) => image.evaluate((element) => getComputedStyle(element).filter);

test.beforeEach(async ({ page }) => {
	await seedConfig(page, seededConfig);
});

test('every hair thumbnail loads once it scrolls into view', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('tab', { name: 'Hair' }).click();

	const thumbnails = page.getByRole('radiogroup', { name: 'Hair items' }).getByRole('img');
	await expect(thumbnails).toHaveCount(HAIR_STYLES);

	for (let index = 0; index < HAIR_STYLES; index++) {
		const thumbnail = thumbnails.nth(index);
		await thumbnail.scrollIntoViewIfNeeded();
		await expect
			.poll(() => thumbnail.evaluate((image: HTMLImageElement) => image.naturalWidth), {
				message: `Hair thumbnail ${index + 1}`
			})
			.toBeGreaterThan(0);
	}
});

// The browser stays in light colour scheme, so the dark case shows thumbnails follow the app's theme
for (const { theme, filter } of [
	{ theme: 'Light', filter: 'none' },
	{ theme: 'Dark', filter: 'invert(1)' }
] as const) {
	test(`${theme} theme renders the avatar and ${filter} thumbnails`, async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Toggle theme' }).click();
		await page.getByRole('menuitem', { name: theme }).click();

		await page.getByRole('tab', { name: 'Hair' }).click();
		const thumbnail = page.getByRole('img', { name: 'Hair Preview 2', exact: true });
		await expect.poll(() => filterOf(thumbnail)).toContain(filter);
		await expect.poll(() => readAvatarSvg(page)).toContain(layerMarkup('hair', 0));
	});
}
