import { Context } from 'runed';
import type { AvatarStoreClass } from '$lib/components/ui/avatar-creator/AvatarStore.svelte';

/**
 * Svelte Runed Context for sharing the AvatarStoreClass instance.
 *
 * Usage:
 * // In a parent component (e.g., +layout.svelte):
 * import { avatarContext } from '$lib/contexts/avatarContext';
 * import { AvatarStoreClass } from '$lib/components/ui/avatar-creator/AvatarStore.svelte';
 * avatarContext.set(new AvatarStoreClass());
 *
 * // In a child component:
 * import { avatarContext } from '$lib/contexts/avatarContext';
 * const avatarStore = avatarContext.get();
 */
export const avatarContext = new Context<AvatarStoreClass>('avatarStore');
