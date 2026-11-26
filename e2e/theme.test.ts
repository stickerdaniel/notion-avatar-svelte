import { expect, test, type Page } from '@playwright/test';

const MODE_KEY = 'mode-watcher-mode';

type Scheme = 'light' | 'dark';

const opposite = { light: 'dark', dark: 'light' } as const;
const label = { light: 'Light', dark: 'Dark', system: 'System' } as const;

const appliedScheme = (page: Page) =>
	page.evaluate(() => {
		const root = document.documentElement;
		return {
			dark: root.classList.contains('dark'),
			colorScheme: getComputedStyle(root).colorScheme
		};
	});

const storedMode = (page: Page) => page.evaluate((key) => localStorage.getItem(key), MODE_KEY);

async function expectScheme(page: Page, scheme: Scheme): Promise<void> {
	await expect
		.poll(() => appliedScheme(page))
		.toEqual({ dark: scheme === 'dark', colorScheme: scheme });
}

async function choose(page: Page, mode: keyof typeof label): Promise<void> {
	await page.getByRole('button', { name: 'Toggle theme' }).click();
	await page.getByRole('menuitem', { name: label[mode] }).click();
}

async function waitForHydration(page: Page): Promise<void> {
	await page.getByRole('button', { name: 'Toggle theme' }).click();
	await expect(page.getByRole('menuitem', { name: 'System' })).toBeVisible();
	await page.keyboard.press('Escape');
}

for (const scheme of ['light', 'dark'] as const) {
	test(`a chosen ${scheme} theme survives a reload with every app script blocked`, async ({
		page
	}) => {
		await page.emulateMedia({ colorScheme: opposite[scheme] });
		await page.goto('/');
		await choose(page, scheme);
		await expectScheme(page, scheme);
		expect(await storedMode(page)).toBe(scheme);

		const blocked: string[] = [];
		await page.route(
			(url) => url.pathname.startsWith('/_app/') && url.pathname.endsWith('.js'),
			async (route) => {
				blocked.push(route.request().url());
				await route.abort();
			}
		);
		await page.reload();

		await expect.poll(() => blocked.length).toBeGreaterThan(0);
		expect(await appliedScheme(page)).toEqual({ dark: scheme === 'dark', colorScheme: scheme });
	});
}

test('System follows prefers-color-scheme without a reload', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'dark' });
	await page.goto('/');
	await choose(page, 'light');
	await expectScheme(page, 'light');

	await choose(page, 'system');
	await expectScheme(page, 'dark');
	expect(await storedMode(page)).toBe('system');

	await page.emulateMedia({ colorScheme: 'light' });
	await expectScheme(page, 'light');
	await page.emulateMedia({ colorScheme: 'dark' });
	await expectScheme(page, 'dark');
});

test('another page of the same context follows a change', async ({ context }) => {
	const first = await context.newPage();
	const second = await context.newPage();
	for (const page of [first, second]) {
		await page.emulateMedia({ colorScheme: 'light' });
		await page.goto('/');
		await waitForHydration(page);
	}

	await choose(first, 'dark');
	await expectScheme(second, 'dark');

	await choose(first, 'system');
	await expectScheme(second, 'light');
});

for (const { stored, system, applied } of [
	{ stored: 'light', system: 'dark', applied: 'light' },
	{ stored: 'dark', system: 'light', applied: 'dark' },
	{ stored: 'system', system: 'dark', applied: 'dark' }
] as const) {
	test(`a stored ${stored} mode selects the ${applied} theme`, async ({ page }) => {
		await page.addInitScript(
			([key, value]) => {
				if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
			},
			[MODE_KEY, stored] as const
		);
		await page.emulateMedia({ colorScheme: system });
		await page.goto('/');
		await waitForHydration(page);

		await expectScheme(page, applied);
		expect(await storedMode(page)).toBe(stored);
	});
}
