import { expect, test, type Page } from '@playwright/test';
import {
	downloadConfig,
	layerMarkup,
	readAvatarSvg,
	readPreviewConfig,
	uploadConfig
} from './avatar';
import {
	encodeConfig,
	readRawConfig,
	readStoredConfig,
	seedConfig,
	seedRawConfig,
	seededConfig,
	type StoredConfig
} from './storage';

const editor = (page: Page) => page.getByRole('region', { name: 'Avatar Editor' });

// Collects uncaught page errors, so a test can assert that none happened.
function trackPageErrors(page: Page): Error[] {
	const errors: Error[] = [];
	page.on('pageerror', (error) => errors.push(error));
	return errors;
}

// Waits until the avatar shows the face and hair layers the config selects.
async function expectAvatarOf(page: Page, config: StoredConfig): Promise<void> {
	const face = layerMarkup('face', config.items.face);
	const hair = layerMarkup('hair', config.items.hair);
	await expect
		.poll(async () => {
			const svg = await readAvatarSvg(page);
			return svg.includes(face) && svg.includes(hair);
		})
		.toBe(true);
}

test('an imported config with an out-of-range item is rejected and changes nothing', async ({
	page
}) => {
	await seedConfig(page, seededConfig);
	await page.goto('/');
	await expectAvatarOf(page, seededConfig);
	const raw = await readRawConfig(page);
	const avatar = await readAvatarSvg(page);

	await uploadConfig(page, { ...seededConfig, items: { ...seededConfig.items, hair: 999 } });

	await expect(page.getByText('Invalid avatar configuration')).toBeVisible();
	await expect(page.getByText('Config item "hair"')).toBeVisible();
	expect(await readRawConfig(page)).toBe(raw);
	expect(await readAvatarSvg(page)).toBe(avatar);
});

test('a config from another version keeps its data through save, download, randomize, undo and reload', async ({
	page
}) => {
	const imported = {
		...seededConfig,
		version: 2,
		items: { ...seededConfig.items, hair: 3, halo: 4 },
		metadata: { source: 'legacy' }
	};
	await seedConfig(page, seededConfig);
	await page.goto('/');
	await expectAvatarOf(page, seededConfig);

	await uploadConfig(page, imported);
	await expect.poll(() => readStoredConfig(page)).toEqual(imported);

	await editor(page).getByRole('button', { name: 'Save', exact: true }).click();
	const saved = await readStoredConfig(page);
	expect(saved.lastModified).not.toBe(imported.lastModified);
	expect({ ...saved, lastModified: imported.lastModified }).toEqual(imported);
	expect(await downloadConfig(page)).toEqual(saved);

	await editor(page).getByRole('button', { name: 'Generate random avatar' }).click();
	await expect
		.poll(async () => (await readStoredConfig(page)).lastModified)
		.not.toBe(saved.lastModified);
	expect(await readStoredConfig(page)).toMatchObject({ version: 2, metadata: imported.metadata });

	await editor(page).getByRole('button', { name: 'Undo', exact: true }).click();
	await expect.poll(() => readStoredConfig(page)).toEqual(saved);

	await page.reload();
	await expectAvatarOf(page, saved);
	expect(await readStoredConfig(page)).toEqual(saved);
	expect(await readPreviewConfig(page)).toEqual(saved);
});

const corruptedStorage = [
	{ name: 'storage that is not JSON', raw: '{"version":1,' },
	{
		name: 'a stored config with an out-of-range item',
		raw: encodeConfig({ ...seededConfig, items: { ...seededConfig.items, hair: 999 } })
	}
];

for (const { name, raw } of corruptedStorage) {
	test(`${name} is shown as a random avatar and kept until the first edit`, async ({ page }) => {
		const errors = trackPageErrors(page);
		await seedRawConfig(page, raw);

		for (const load of [() => page.goto('/'), () => page.reload()]) {
			await load();
			const shown = (await readPreviewConfig(page)) as StoredConfig;
			await expectAvatarOf(page, shown);
			expect(await downloadConfig(page)).toEqual(shown);
			expect(await readRawConfig(page)).toBe(raw);
		}

		// Pick a hair other than the random one, so the click is always an edit
		const shown = (await readPreviewConfig(page)) as StoredConfig;
		const hair = ((shown.items.hair ?? 0) + 1) % 59;
		await page.getByRole('tab', { name: 'Hair' }).click();
		await page.getByRole('radio', { name: `Select Hair ${hair + 1}`, exact: true }).click();

		await expect.poll(() => readRawConfig(page)).not.toBe(raw);
		const stored = await readStoredConfig(page);
		expect(stored.items.hair).toBe(hair);
		expect(await readPreviewConfig(page)).toEqual(stored);
		await expectAvatarOf(page, stored);

		// Only a valid stored config survives a reload instead of a new random fallback
		await page.reload();
		expect(await readPreviewConfig(page)).toEqual(stored);
		await expectAvatarOf(page, stored);
		expect(errors).toEqual([]);
	});
}
