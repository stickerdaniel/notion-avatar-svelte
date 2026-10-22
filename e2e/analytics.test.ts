import { expect, test, type Page } from '@playwright/test';
import { downloadConfig, uploadConfig } from './avatar';
import { seedConfig, seededConfig } from './storage';

type AnalyticsEvent = { event: string; data: Record<string, unknown> };

declare global {
	interface Window {
		analyticsEvents: AnalyticsEvent[];
	}
}

// Records what Umami would send: `window.umami.track` calls, and the data-umami-* attributes of
// clicked elements, which Umami's script reads in a capturing document click listener.
async function recordAnalytics(page: Page): Promise<void> {
	await page.addInitScript(() => {
		const events: AnalyticsEvent[] = [];
		window.analyticsEvents = events;
		window.umami = { track: (event, data) => events.push({ event, data: { ...data } }) };
		document.addEventListener(
			'click',
			({ target }) => {
				const element = target instanceof Element && target.closest('[data-umami-event]');
				if (!element) return;
				const data: Record<string, string> = {};
				for (const name of element.getAttributeNames()) {
					const key = name.match(/^data-umami-event-(.+)$/)?.[1];
					if (key) data[key] = element.getAttribute(name) ?? '';
				}
				events.push({ event: element.getAttribute('data-umami-event') ?? '', data });
			},
			true
		);
	});
}

async function downloadAvatar(page: Page, variant: string): Promise<void> {
	const download = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Download', exact: true }).click();
	await page.getByRole('menuitem', { name: variant }).click();
	await download;
}

test('analytics events carry no username, filename or config', async ({ page }) => {
	const username = 'Ada Secret';
	const config = { ...seededConfig, username };
	await recordAnalytics(page);
	await seedConfig(page, config);
	await page.goto('/');

	await downloadConfig(page);
	await uploadConfig(page, config, 'ada-secret.json');
	await expect(page.getByText('Avatar configuration loaded')).toBeVisible();
	// The validation error quotes the bad value, so it must stay out of the failure event.
	await uploadConfig(page, { ...config, items: { ...config.items, hair: username } }, 'bad.json');
	await expect(page.getByText('Invalid avatar configuration')).toBeVisible();
	for (const variant of [
		'Transparent Background',
		'Transparent with Outline',
		'Colored Background'
	]) {
		await downloadAvatar(page, variant);
	}

	// Exact payloads, so any extra field, such as the username or a filename, fails the test.
	const events = await page.evaluate(() => window.analyticsEvents);
	expect(events).toEqual([
		{ event: 'config-download', data: {} },
		{ event: 'config-uploaded', data: { success: true } },
		{ event: 'config-uploaded', data: { success: false } },
		{ event: 'avatar-download-transparent', data: {} },
		{ event: 'avatar-download', data: { type: 'no-outline', color: 'blue' } },
		{ event: 'avatar-download-outlined', data: {} },
		{ event: 'avatar-download', data: { type: 'with-outline', color: 'blue' } },
		{ event: 'avatar-download-background', data: {} },
		{ event: 'avatar-download', data: { type: 'with-background', color: 'blue' } }
	]);
});
