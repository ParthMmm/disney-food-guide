import { browser } from "$app/environment";

const STORAGE_KEY = "fom-favorites";

function createFavoritesStore() {
	let favorites = $state<Set<number>>(new Set());

	if (browser) {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored) as number[];
				favorites = new Set(parsed);
			} catch {
				favorites = new Set();
			}
		}
	}

	function toggle(itemId: number) {
		const newFavorites = new Set(favorites);
		if (newFavorites.has(itemId)) {
			newFavorites.delete(itemId);
		} else {
			newFavorites.add(itemId);
		}
		favorites = newFavorites;

		if (browser) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)));
		}
	}

	function isFavorite(itemId: number): boolean {
		return favorites.has(itemId);
	}

	function clear() {
		favorites = new Set();
		if (browser) {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	return {
		get favorites() {
			return favorites;
		},
		get count() {
			return favorites.size;
		},
		toggle,
		isFavorite,
		clear,
	};
}

export const favoritesStore = createFavoritesStore();
