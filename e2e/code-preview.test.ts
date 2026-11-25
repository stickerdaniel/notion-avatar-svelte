import { expect, test, type Page } from '@playwright/test';
import { uploadConfig } from './avatar';
import { seedConfig, seededConfig } from './storage';

declare global {
	interface Window {
		__xss?: number;
	}
}

const username = `<img src=x onerror='window.__xss=1'>`;

async function holdSanitizer(page: Page) {
	let release = () => {};
	const released = new Promise<void>((resolve) => (release = resolve));
	let held = false;

	await page.route('**/_app/immutable/chunks/*.js', async (route) => {
		const response = await route.fetch();
		const body = await response.text();
		if (body.includes('DOMPurify')) {
			held = true;
			await released;
		}
		await route.fulfill({ response, body });
	});

	return { release, wasHeld: () => held };
}

test('the config preview shows an imported username containing markup as text', async ({
	page
}) => {
	await seedConfig(page, seededConfig);
	const sanitizer = await holdSanitizer(page);
	const usernameLine = page.getByText(`"username": "${username}"`);
	const highlightedToken = page.locator('pre [style*="--shiki-dark"]').first();
	const xss = () => page.evaluate(() => window.__xss);

	await page.goto('/');
	await expect.poll(sanitizer.wasHeld).toBe(true);
	await uploadConfig(page, { ...seededConfig, username });
	await expect(usernameLine).toBeVisible();
	expect(await xss()).toBeUndefined();

	sanitizer.release();
	await expect(highlightedToken).toBeVisible();
	await expect(usernameLine).toBeVisible();
	expect(await xss()).toBeUndefined();

	await page.reload();
	await expect(usernameLine).toBeVisible();
	expect(await xss()).toBeUndefined();
	await expect(highlightedToken).toBeVisible();
	await expect(usernameLine).toBeVisible();
	expect(await xss()).toBeUndefined();
});
