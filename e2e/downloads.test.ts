import { expect, test, type Page } from '@playwright/test';
import { downloadAvatar, layerMarkup, readAvatarSvg } from './avatar';
import { controlLayer, installFetchControl } from './fetch-control';
import { seedConfig, seededConfig } from './storage';

const withoutIds = (svg: string) => svg.trim().replace(/avatar-[0-9a-z]+-/g, 'avatar-ID-');

async function readPreview(page: Page): Promise<string> {
	return withoutIds(await readAvatarSvg(page));
}

async function download(page: Page, variant: string): Promise<{ filename: string; svg: string }> {
	const { filename, svg } = await downloadAvatar(page, variant);
	return { filename, svg: withoutIds(svg) };
}

test.beforeEach(async ({ page }) => {
	await installFetchControl(page);
	await seedConfig(page, seededConfig);
	await page.goto('/');
	await expect.poll(() => readAvatarSvg(page)).toContain(layerMarkup('hair', 0));
});

test('the transparent download is the preview without its outline', async ({ page }) => {
	const preview = await readPreview(page);
	const outline = /<g id='avatar-ID-outline'>[\s\S]*?(?=<g id='avatar-ID-)/;
	expect(preview).toMatch(outline);

	expect(await download(page, 'Transparent Background')).toEqual({
		filename: 'avatar-Ada-no-outline.svg',
		svg: preview.replace(outline, '')
	});
});

test('the outlined download is the preview', async ({ page }) => {
	expect(await download(page, 'Transparent with Outline')).toEqual({
		filename: 'avatar-Ada-with-outline.svg',
		svg: await readPreview(page)
	});
});

test('the background download fills the selected colour behind the preview', async ({ page }) => {
	await page.getByRole('radio', { name: 'Select color teal' }).click();
	const preview = await readPreview(page);

	expect(await download(page, 'Colored Background')).toEqual({
		filename: 'avatar-Ada-with-bg.svg',
		svg: preview.replace(/^<svg[^>]*>/, "$&<rect width='1080' height='1080' fill='#2DD4BF' />")
	});
});

test('non-ASCII layer text survives the preview and the download', async ({ page }) => {
	const title = '<title>Zoë ✓</title>';
	await controlLayer(page, 'hair', 1, { title: 'Zoë ✓' });
	await page.getByRole('tab', { name: 'Hair' }).click();
	await page.getByRole('radio', { name: 'Select Hair 2', exact: true }).click();

	await expect.poll(() => readAvatarSvg(page)).toContain(title);
	expect((await download(page, 'Transparent Background')).svg).toContain(title);
});
