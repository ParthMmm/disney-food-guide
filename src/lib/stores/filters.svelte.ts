import { browser } from "$app/environment";

const STORAGE_KEY = "fom-filters";

interface FilterState {
	searchQuery: string;
	selectedCategory: string;
	selectedTags: string[];
	priceRange: number[];
	mobileOrderOnly: boolean;
	selectedDates: string[];
	selectedLocations: string[];
	favoritesOnly: boolean;
}

const DEFAULT_FILTERS: FilterState = {
	searchQuery: "",
	selectedCategory: "all",
	selectedTags: [],
	priceRange: [1, 30],
	mobileOrderOnly: false,
	selectedDates: [],
	selectedLocations: [],
	favoritesOnly: false,
};

function createFiltersStore() {
	let searchQuery = $state("");
	let selectedCategory = $state<string>("all");
	let selectedTags = $state<Set<string>>(new Set());
	let priceRange = $state([1, 30]);
	let mobileOrderOnly = $state(false);
	let selectedDates = $state<Set<string>>(new Set());
	let selectedLocations = $state<Set<string>>(new Set());
	let favoritesOnly = $state(false);

	if (browser) {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored) as FilterState;
				searchQuery = parsed.searchQuery || "";
				selectedCategory = parsed.selectedCategory || "all";
				selectedTags = new Set(parsed.selectedTags || []);
				priceRange = parsed.priceRange || [1, 30];
				mobileOrderOnly = parsed.mobileOrderOnly || false;
				selectedDates = new Set(parsed.selectedDates || []);
				selectedLocations = new Set(parsed.selectedLocations || []);
				favoritesOnly = parsed.favoritesOnly || false;
			} catch {
				Object.assign({}, DEFAULT_FILTERS);
			}
		}
	}

	function save() {
		if (browser) {
			const data: FilterState = {
				searchQuery,
				selectedCategory,
				selectedTags: Array.from(selectedTags),
				priceRange,
				mobileOrderOnly,
				selectedDates: Array.from(selectedDates),
				selectedLocations: Array.from(selectedLocations),
				favoritesOnly,
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		}
	}

	function setSearchQuery(value: string) {
		searchQuery = value;
		save();
	}

	function setSelectedCategory(value: string) {
		selectedCategory = value;
		save();
	}

	function toggleTag(tag: string) {
		const newTags = new Set(selectedTags);
		if (newTags.has(tag)) {
			newTags.delete(tag);
		} else {
			newTags.add(tag);
		}
		selectedTags = newTags;
		save();
	}

	function setPriceRange(value: number[]) {
		priceRange = value;
		save();
	}

	function setMobileOrderOnly(value: boolean) {
		mobileOrderOnly = value;
		save();
	}

	function toggleDate(dateId: string) {
		const newDates = new Set(selectedDates);
		if (newDates.has(dateId)) {
			newDates.delete(dateId);
		} else {
			newDates.add(dateId);
		}
		selectedDates = newDates;
		save();
	}

	function toggleLocation(location: string) {
		const newLocations = new Set(selectedLocations);
		if (newLocations.has(location)) {
			newLocations.delete(location);
		} else {
			newLocations.add(location);
		}
		selectedLocations = newLocations;
		save();
	}

	function setFavoritesOnly(value: boolean) {
		favoritesOnly = value;
		save();
	}

	function clearFilters() {
		searchQuery = DEFAULT_FILTERS.searchQuery;
		selectedCategory = DEFAULT_FILTERS.selectedCategory;
		selectedTags = new Set(DEFAULT_FILTERS.selectedTags);
		priceRange = [...DEFAULT_FILTERS.priceRange];
		mobileOrderOnly = DEFAULT_FILTERS.mobileOrderOnly;
		selectedDates = new Set(DEFAULT_FILTERS.selectedDates);
		selectedLocations = new Set(DEFAULT_FILTERS.selectedLocations);
		save();
	}

	return {
		get searchQuery() {
			return searchQuery;
		},
		get selectedCategory() {
			return selectedCategory;
		},
		get selectedTags() {
			return selectedTags;
		},
		get priceRange() {
			return priceRange;
		},
		get mobileOrderOnly() {
			return mobileOrderOnly;
		},
		get selectedDates() {
			return selectedDates;
		},
		get selectedLocations() {
			return selectedLocations;
		},
		get favoritesOnly() {
			return favoritesOnly;
		},
		setSearchQuery,
		setSelectedCategory,
		toggleTag,
		setPriceRange,
		setMobileOrderOnly,
		toggleDate,
		toggleLocation,
		setFavoritesOnly,
		clearFilters,
	};
}

export const filtersStore = createFiltersStore();
