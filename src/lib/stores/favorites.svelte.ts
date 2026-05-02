import { browser } from "$app/environment";

const STORAGE_KEY = "fom-favorites";

function createFavoritesStore() {
	let favorites = $state<Set<number>>(new Set());

	function hydrate() {
		if (!browser) return;

		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (!stored) return;

			const parsed = JSON.parse(stored) as number[];
			favorites = new Set(parsed);
		} catch {
			favorites = new Set();
		}
	}

	function save() {
		if (browser) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)));
		}
	}

	function toggle(itemId: number) {
		const nextFavorites = new Set(favorites);
		if (nextFavorites.has(itemId)) {
			nextFavorites.delete(itemId);
		} else {
			nextFavorites.add(itemId);
		}

		favorites = nextFavorites;
		save();
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
		hydrate,
		toggle,
		isFavorite,
		clear,
	};
}

export const favoritesStore = createFavoritesStore();
