import { expect, test, type Page } from '@playwright/test';
import { layerMarkup, readAvatarSvg } from './avatar';
import { encodeConfig, seedRawConfig, seededConfig } from './storage';

// The avatar's pixel at (x, y) of its 1080 × 1080 viewBox, drawn at full size, as [r, g, b, a].
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
	// Face 0 alone: on the line y = 619, its black 24-unit stroke ends at x = 784.
	const items = Object.fromEntries(Object.keys(seededConfig.items).map((id) => [id, null]));
	await seedRawConfig(page, encodeConfig({ ...seededConfig, items: { ...items, face: 0 } }));
	await page.goto('/');
	await expect.poll(() => readAvatarSvg(page)).toContain(layerMarkup('face', 0));

	expect(await avatarPixel(page, 794, 619)).toEqual([255, 255, 255, 255]);
	expect((await avatarPixel(page, 814, 619))[3]).toBe(0);
});
