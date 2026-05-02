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
	let searchQuery = $state(DEFAULT_FILTERS.searchQuery);
	let selectedCategory = $state<string>(DEFAULT_FILTERS.selectedCategory);
	let selectedTags = $state<Set<string>>(new Set(DEFAULT_FILTERS.selectedTags));
	let priceRange = $state([...DEFAULT_FILTERS.priceRange]);
	let mobileOrderOnly = $state(DEFAULT_FILTERS.mobileOrderOnly);
	let selectedDates = $state<Set<string>>(new Set(DEFAULT_FILTERS.selectedDates));
	let selectedLocations = $state<Set<string>>(new Set(DEFAULT_FILTERS.selectedLocations));
	let favoritesOnly = $state(DEFAULT_FILTERS.favoritesOnly);

	function applyFilters(filters: FilterState) {
		searchQuery = filters.searchQuery || DEFAULT_FILTERS.searchQuery;
		selectedCategory = filters.selectedCategory || DEFAULT_FILTERS.selectedCategory;
		selectedTags = new Set(filters.selectedTags || DEFAULT_FILTERS.selectedTags);
		priceRange = filters.priceRange || [...DEFAULT_FILTERS.priceRange];
		mobileOrderOnly = filters.mobileOrderOnly || DEFAULT_FILTERS.mobileOrderOnly;
		selectedDates = new Set(filters.selectedDates || DEFAULT_FILTERS.selectedDates);
		selectedLocations = new Set(filters.selectedLocations || DEFAULT_FILTERS.selectedLocations);
		favoritesOnly = filters.favoritesOnly || DEFAULT_FILTERS.favoritesOnly;
	}

	function hydrate() {
		if (!browser) return;

		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) applyFilters(JSON.parse(stored) as FilterState);
		} catch {
			applyFilters(DEFAULT_FILTERS);
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

	function toggleSetValue(values: Set<string>, value: string) {
		const nextValues = new Set(values);
		if (nextValues.has(value)) {
			nextValues.delete(value);
		} else {
			nextValues.add(value);
		}
		return nextValues;
	}

	function toggleTag(tag: string) {
		selectedTags = toggleSetValue(selectedTags, tag);
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
		selectedDates = toggleSetValue(selectedDates, dateId);
		save();
	}

	function toggleLocation(location: string) {
		selectedLocations = toggleSetValue(selectedLocations, location);
		save();
	}

	function setFavoritesOnly(value: boolean) {
		favoritesOnly = value;
		save();
	}

	function clearFilters() {
		applyFilters(DEFAULT_FILTERS);
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
		hydrate,
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
