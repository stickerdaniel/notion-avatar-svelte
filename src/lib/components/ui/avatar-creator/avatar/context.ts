import { getContext, setContext } from 'svelte';
import type { IAvatar } from '../AvatarStore.svelte';

export const AVATAR_DISPLAY_CONTEXT_KEY = Symbol('avatar-display-context');

export interface AvatarDisplayContext {
	store: IAvatar;
	usePreview: boolean;
}

export function setAvatarDisplayContext(context: AvatarDisplayContext) {
	setContext(AVATAR_DISPLAY_CONTEXT_KEY, context);
}

export function getAvatarDisplayContext(): AvatarDisplayContext {
	return getContext<AvatarDisplayContext>(AVATAR_DISPLAY_CONTEXT_KEY);
}
