import { browser } from '$app/env';
import { on } from 'svelte/events';
import { MediaQuery } from 'svelte/reactivity';

export type ThemeMode = 'light' | 'dark' | 'system';

const storageKey = 'mode-watcher-mode';

const toMode = (value: string | null): ThemeMode =>
	value === 'light' || value === 'dark' ? value : 'system';

class Theme {
	#prefersLight = new MediaQuery('prefers-color-scheme: light');
	#mode = $state(browser ? toMode(localStorage.getItem(storageKey)) : 'system');

	readonly scheme = $derived(
		this.#mode === 'system' ? (this.#prefersLight.current ? 'light' : 'dark') : this.#mode
	);

	get mode(): ThemeMode {
		return this.#mode;
	}

	set mode(mode: ThemeMode) {
		this.#mode = mode;
		localStorage.setItem(storageKey, mode);
	}

	watch(): void {
		$effect(() => {
			const root = document.documentElement;
			const pause = document.head.appendChild(document.createElement('style'));
			pause.textContent = '*{transition:none!important}';
			root.classList.toggle('dark', this.scheme === 'dark');
			root.style.colorScheme = this.scheme;
			requestAnimationFrame(() => requestAnimationFrame(() => pause.remove()));
		});
		$effect(() =>
			on(window, 'storage', (event) => {
				if (event.key === storageKey) this.#mode = toMode(event.newValue);
			})
		);
	}
}

export const theme = new Theme();
