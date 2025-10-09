import { browser } from "$app/environment";

const STORAGE_KEY = "fom-view-preferences";

type ViewMode = "grid" | "condensed";

interface ViewPreferences {
	viewMode: ViewMode;
	openCategories: string[];
}

function createViewPreferencesStore() {
	let viewMode = $state<ViewMode>("condensed");
	let openCategories = $state<Set<string>>(new Set());

	if (browser) {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored) as ViewPreferences;
				viewMode = parsed.viewMode || "condensed";
				openCategories = new Set(parsed.openCategories || []);
			} catch {
				viewMode = "condensed";
				openCategories = new Set();
			}
		}
	}

	function save() {
		if (browser) {
			const data: ViewPreferences = {
				viewMode,
				openCategories: Array.from(openCategories),
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		}
	}

	function setViewMode(mode: ViewMode) {
		viewMode = mode;
		save();
	}

	function toggleCategory(category: string) {
		const newCategories = new Set(openCategories);
		if (newCategories.has(category)) {
			newCategories.delete(category);
		} else {
			newCategories.add(category);
		}
		openCategories = newCategories;
		save();
	}

	return {
		get viewMode() {
			return viewMode;
		},
		get openCategories() {
			return openCategories;
		},
		setViewMode,
		toggleCategory,
	};
}

export const viewPreferencesStore = createViewPreferencesStore();
