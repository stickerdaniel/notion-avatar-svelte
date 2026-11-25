import { expect, test, type Page } from '@playwright/test';
import { layerMarkup, readAvatarSvg } from './avatar';
import { encodeConfig, seedRawConfig, seededConfig } from './storage';

async function avatarPixel(page: Page, x: number, y: number): Promise<number[]> {
	const src = await page
		.getByRole('region', { name: 'Avatar Editor' })
		.getByRole('img', { name: /^Avatar for / })
		.getAttribute('src');
	return page.evaluate(
		async ({ src, x, y }) => {
			const image = new Image(1080, 1080);
			image.src = src;
			await image.decode();
			const context = new OffscreenCanvas(1080, 1080).getContext('2d')!;
			context.drawImage(image, 0, 0, 1080, 1080);
			return [...context.getImageData(x, y, 1, 1).data];
		},
		{ src: src!, x, y }
	);
}

test('the avatar has a white outline 20 units wide', async ({ page }) => {
	const items = Object.fromEntries(Object.keys(seededConfig.items).map((id) => [id, null]));
	await seedRawConfig(page, encodeConfig({ ...seededConfig, items: { ...items, face: 0 } }));
	await page.goto('/');
	await expect.poll(() => readAvatarSvg(page)).toContain(layerMarkup('face', 0));

	expect(await avatarPixel(page, 794, 619)).toEqual([255, 255, 255, 255]);
	expect((await avatarPixel(page, 814, 619))[3]).toBe(0);
});
