import { Context } from 'runed';
import type { AvatarStoreClass } from './AvatarStore.svelte';

export const avatarContext = new Context<AvatarStoreClass>('avatarStore');
