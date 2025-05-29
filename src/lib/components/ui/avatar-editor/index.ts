import AvatarEditor from './avatar-editor.svelte';
import { AvatarStoreClass } from './AvatarStore.svelte';
import { avatarContext } from './avatarContext';
import CategorySelector from './category-selector.svelte';
import ColorSelector from './color-selector.svelte';
import AnimatedDiceButton from './animated-dice-button.svelte';

// Export the main component
export { AvatarEditor };

// Export the store class and context
export { AvatarStoreClass, avatarContext };

// Export sub-components (if users want to use them separately)
export { CategorySelector, ColorSelector, AnimatedDiceButton };

// Export types
export * from './types';

// Export SVG utilities
export * from './avatar-svg-utils';

// Default export
export default AvatarEditor;
