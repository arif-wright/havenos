import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type FavoriteKind = 'animal' | 'rescue';

export type FavoriteState = {
	animals: string[];
	rescues: string[];
};

const STORAGE_KEY = 'rescueos:favorites';

const readFromStorage = (): FavoriteState => {
	if (!browser) return { animals: [], rescues: [] };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { animals: [], rescues: [] };
		const parsed = JSON.parse(raw) as Partial<FavoriteState>;
		return {
			animals: Array.isArray(parsed.animals) ? parsed.animals : [],
			rescues: Array.isArray(parsed.rescues) ? parsed.rescues : []
		};
	} catch (error) {
		console.error('Failed to read favorites', error);
		return { animals: [], rescues: [] };
	}
};

const persist = (state: FavoriteState) => {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch (error) {
		console.error('Failed to save favorites', error);
	}
};

export const favorites = writable<FavoriteState>({ animals: [], rescues: [] });

if (browser) {
	favorites.set(readFromStorage());
	favorites.subscribe((value) => persist(value));
}

const ensureUnique = (items: string[]) => Array.from(new Set(items));

export const toggleFavorite = (kind: FavoriteKind, id: string) => {
	favorites.update((current) => {
		const next = { ...current };
		const list = kind === 'animal' ? next.animals : next.rescues;
		if (list.includes(id)) {
			const filtered = list.filter((item) => item !== id);
			if (kind === 'animal') next.animals = filtered;
			else next.rescues = filtered;
		} else {
			if (kind === 'animal') next.animals = ensureUnique([...list, id]);
			else next.rescues = ensureUnique([...list, id]);
		}
		return next;
	});
};

export const isFavorite = (state: FavoriteState, kind: FavoriteKind, id: string) => {
	return kind === 'animal' ? state.animals.includes(id) : state.rescues.includes(id);
};
