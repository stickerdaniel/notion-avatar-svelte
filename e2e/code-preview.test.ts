import { expect, test, type Page } from '@playwright/test';
import { seedConfig, seededConfig } from './storage';

declare global {
	interface Window {
		__xss?: number;
	}
}

// Single quotes survive JSON.stringify, so the payload stays executable if the preview injects it as HTML.
const username = `<img src=x onerror='window.__xss=1'>`;

// Holds the DOMPurify chunk until released, keeping the preview in its state before sanitising.
// Chunk names are hashes, so the chunk is recognised by DOMPurify's own name in its source.
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

async function uploadConfig(page: Page, config: object): Promise<void> {
	const fileChooser = page.waitForEvent('filechooser');
	await page.getByRole('button', { name: 'Upload avatar configuration from JSON file' }).click();
	await (
		await fileChooser
	).setFiles({
		name: 'avatar.json',
		mimeType: 'application/json',
		buffer: Buffer.from(JSON.stringify(config))
	});
}

// Hydration keeps the prerendered preview, so the config changes after load to reach the unsanitised state.
test('the config preview shows an imported username containing markup as text', async ({
	page
}) => {
	await seedConfig(page, seededConfig);
	const sanitizer = await holdSanitizer(page);
	const usernameLine = page.getByText(`"username": "${username}"`);
	// Shiki colours tokens through these variables, so their presence means highlighting has run
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
