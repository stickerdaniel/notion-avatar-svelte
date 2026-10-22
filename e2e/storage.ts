import type { Page } from '@playwright/test';

export const STORAGE_KEY = 'notionAvatarConfig';

export const seededConfig = {
	version: 1,
	username: 'Ada',
	colorName: 'blue',
	lastModified: '2026-01-01T00:00:00.000Z',
	items: {
		face: 0,
		nose: 0,
		mouth: 0,
		eyes: 0,
		eyebrows: 0,
		glasses: 0,
		hair: 0,
		accessories: 0,
		details: 0,
		beard: 0
	}
};

export type StoredConfig = typeof seededConfig;

// Init scripts run on every navigation, so seed only once and let reloads keep the stored state.
// Runed's PersistedState JSON-encodes the store's config string, so storage holds it twice encoded.
export async function seedConfig(page: Page, config: StoredConfig): Promise<void> {
	await page.addInitScript(
		([key, value]) => {
			if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
		},
		[STORAGE_KEY, JSON.stringify(JSON.stringify(config))] as const
	);
}
