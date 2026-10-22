// Lives outside avatar-editor/ because jsrepo ships that whole folder to consumers.
import { describe, expect, it } from 'vitest';
import {
	AvatarConfigValidationError,
	parseAvatarConfig
} from '$lib/components/ui/avatar-editor/config';

const validConfig = {
	version: 1,
	username: 'Ada',
	colorName: 'blue',
	lastModified: '2026-01-01T00:00:00.000Z',
	items: {
		face: 3,
		nose: 0,
		mouth: 5,
		eyes: 2,
		eyebrows: 1,
		glasses: 0,
		hair: 58,
		accessories: 0,
		details: 13,
		beard: 16
	}
};

function withItems(items: Record<string, unknown>) {
	return { ...validConfig, items: { ...validConfig.items, ...items } };
}

describe('parseAvatarConfig', () => {
	it('returns a valid config as an equal new object', () => {
		const parsed = parseAvatarConfig(validConfig);

		expect(parsed).toEqual(validConfig);
		expect(parsed).not.toBe(validConfig);
		expect(parsed.items).not.toBe(validConfig.items);
	});

	it('leaves its input unchanged, also when the result is mutated', () => {
		const input = {
			...validConfig,
			colorName: 'gold',
			metadata: { source: 'legacy' },
			items: { hair: 2, extra: { tag: 'x' } }
		};
		const snapshot = structuredClone(input);

		const parsed = parseAvatarConfig(input);
		parsed.items.hair = 7;
		(parsed as unknown as typeof input).metadata.source = 'changed';
		(parsed.items as unknown as typeof input.items).extra.tag = 'changed';

		expect(input).toEqual(snapshot);
	});

	it.each([
		['null', null],
		['a string', 'config'],
		['an array', [validConfig]]
	])('rejects %s', (_, input) => {
		expect(() => parseAvatarConfig(input)).toThrow(AvatarConfigValidationError);
	});

	it.each([
		['items is an array', { items: [] }, 'items object'],
		['items is null', { items: null }, 'items object'],
		['version is a string', { version: '1' }, 'numeric version'],
		['username is missing', { username: undefined }, 'string username'],
		['lastModified is a number', { lastModified: 0 }, 'lastModified'],
		['colorName is a number', { colorName: 3 }, 'colorName string']
	])('rejects a config where %s', (_, override, message) => {
		expect(() => parseAvatarConfig({ ...validConfig, ...override })).toThrow(message);
	});

	it.each([999, 59, -1, 1.5, '3', true])('rejects hair %j with the category named', (hair) => {
		expect(() => parseAvatarConfig(withItems({ hair }))).toThrow(
			expect.objectContaining({
				name: 'AvatarConfigValidationError',
				message: expect.stringContaining('"hair"')
			})
		);
	});

	it('accepts null as no selection', () => {
		expect(parseAvatarConfig(withItems({ hair: null })).items.hair).toBeNull();
	});

	it('fills a missing category with 0', () => {
		const { hair: _, ...items } = validConfig.items;

		expect(parseAvatarConfig({ ...validConfig, items }).items.hair).toBe(0);
	});

	it('keeps unknown item keys and unknown top-level fields', () => {
		const input = { ...withItems({ halo: 4 }), metadata: { source: 'legacy' } };

		expect(parseAvatarConfig(input)).toEqual(input);
	});

	it('accepts other versions unchanged', () => {
		expect(parseAvatarConfig({ ...validConfig, version: 2 }).version).toBe(2);
	});

	it('replaces an unknown colour with rose', () => {
		expect(parseAvatarConfig({ ...validConfig, colorName: 'gold' }).colorName).toBe('rose');
	});
});
