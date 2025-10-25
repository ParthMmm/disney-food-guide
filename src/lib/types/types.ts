// TypeScript type definitions for Disneyland Halloween Food Guide

export interface FoodItem {
	id: number;
	name: string;
	description: string | null;
	location: string | null;
	restaurant: string | null;
	price: number | null;
	category: string;
	itemType: string | null;
	mobileOrderAvailable: boolean;
	availability: {
		startDate: string | null;
		endDate: string | null;
	};
	imageUrl: string | null;
	tags: string[];
}

export type FoodCategory =
	| "alcoholic-beverage"
	| "baked-dessert"
	| "beer"
	| "churro"
	| "cocktail"
	| "coffee-tea"
	| "dessert"
	| "entree-side"
	| "frozen-dessert"
	| "hard-seltzer"
	| "other"
	| "salad"
	| "soft-drink"
	| "specialty-dessert"
	| "wine-cider";

export type FoodTag =
	| "alcoholic"
	| "apple"
	| "baked-goods"
	| "beer"
	| "berry"
	| "budget-friendly"
	| "caramel"
	| "character-themed"
	| "chocolate"
	| "churro"
	| "cocktail"
	| "coffee-tea"
	| "cold"
	| "contains-dairy"
	| "contains-nuts"
	| "dessert"
	| "frozen-dessert"
	| "hard-seltzer"
	| "hot"
	| "limited-time"
	| "meal"
	| "moderate-price"
	| "non-alcoholic"
	| "premium-price"
	| "pumpkin-spice"
	| "savory"
	| "specialty-candy"
	| "spicy"
	| "vegan"
	| "vegetarian"
	| "wine-cider";

export interface FoodGuideMetadata {
	generatedAt: string;
	totalItems: number;
	dataSource: string;
	filters: {
		locations: string[];
		restaurants: string[];
		categories: FoodCategory[];
		allTags: FoodTag[];
	};
}

export interface FoodGuideData {
	metadata: FoodGuideMetadata;
	items: FoodItem[];
}

// Filter interfaces for SvelteKit components
export interface FilterState {
	searchQuery: string;
	selectedLocations: string[];
	selectedRestaurants: string[];
	selectedCategories: FoodCategory[];
	selectedTags: FoodTag[];
	priceRange: {
		min: number | null;
		max: number | null;
	};
	mobileOrderOnly: boolean;
	availableOnDate: string | null;
}

// Utility type for grouped items
export type GroupedItems<T extends string> = Record<T, FoodItem[]>;
