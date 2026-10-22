// Lives outside avatar-editor/ because jsrepo ships that whole folder to consumers.
import { describe, expect, it, vi } from 'vitest';
import {
	DEFAULT_CATEGORIES,
	getPartImagePath,
	getPreviewImagePath
} from '$lib/components/ui/avatar-editor/types';

describe('avatar assets', () => {
	it.each(DEFAULT_CATEGORIES)(
		'$id has a thumbnail and a layer for exactly maxItems items',
		({ id, maxItems }) => {
			vi.spyOn(console, 'warn').mockImplementation(() => {});

			for (let index = 0; index < maxItems; index++) {
				expect(getPartImagePath(id, index), `thumbnail ${index}`).not.toBe('');
				expect(getPreviewImagePath(id, index), `layer ${index}`).not.toBe('');
			}
			expect(getPartImagePath(id, maxItems)).toBe('');
			expect(getPreviewImagePath(id, maxItems)).toBe('');
		}
	);
});
