<script lang="ts">
import type { FoodItem } from "$lib/types/types";
import { FilterIcon } from "lucide-svelte";
import { Badge } from "$lib/components/ui/badge";
import { Button } from "$lib/components/ui/button";
import * as Card from "$lib/components/ui/card";
import CategorySection from "$lib/components/CategorySection.svelte";
import FilterSheet, {
	type FilterItem,
} from "$lib/components/FilterSheet.svelte";
import ItemDetailDrawer from "$lib/components/ItemDetailDrawer.svelte";
import SearchHeader from "$lib/components/SearchHeader.svelte";
import StickySearchBar from "$lib/components/StickySearchBar.svelte";
import { favoritesStore } from "$lib/stores/favorites.svelte";
import { filtersStore } from "$lib/stores/filters.svelte";
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();

let filterSheetOpen = $state(false);
let selectedItem = $state<FoodItem | null>(null);
let detailDrawerOpen = $state(false);
let topSearchElement = $state<HTMLElement>();

// Days until May the 4th. Computed once on mount — a tool, not a stopwatch.
const daysUntilMay4 = (() => {
	const target = new Date("2026-05-04T00:00:00");
	const diff = target.getTime() - Date.now();
	if (diff <= 0) return null;
	return Math.ceil(diff / 86_400_000);
})();

const foodData = $derived(data.foodData);
const metadata = $derived(foodData.metadata);
const items = $derived(foodData.items);
const categories = $derived(metadata.filters.categories);
const allTags = $derived(metadata.filters.allTags);
const locations = $derived(metadata.filters.locations);

const categoryOrder = [
	"churro",
	"dessert",
	"baked-dessert",
	"frozen-dessert",
	"specialty-dessert",
	"coffee-tea",
	"soft-drink",
	"entree-side",
	"trinkets",
	"other",
	"beer",
	"wine-cider",
	"cocktail",
	"hard-seltzer",
	"salad",
];

const categoryRank = new Map(
	categoryOrder.map((category, index) => [category, index]),
);

const dates = [
	{ id: "may4", name: "May the 4th", label: "✨", date: "2026-05-04" },
	{
		id: "may31",
		name: "Available through May",
		label: "🗓️",
		date: "2026-05-31",
	},
];

const DEFAULT_PRICE_RANGE = [1, 30];

function formatFilterLabel(value: string) {
	return value.replace(/-/g, " ").replace(/\b\w/g, (letter) =>
		letter.toUpperCase(),
	);
}

function isDefaultPriceRange() {
	return (
		filtersStore.priceRange[0] === DEFAULT_PRICE_RANGE[0] &&
		filtersStore.priceRange[1] === DEFAULT_PRICE_RANGE[1]
	);
}

function isAvailableOn(item: FoodItem, date: string) {
	const { startDate, endDate } = item.availability;
	const start = startDate ? new Date(startDate) : null;
	const end = endDate ? new Date(endDate) : null;
	const selectedDate = new Date(date);

	return (!start || selectedDate >= start) && (!end || selectedDate <= end);
}

function matchesSelectedDate(item: FoodItem, dateId: string) {
	const selectedDate = dates.find((date) => date.id === dateId);
	return selectedDate ? isAvailableOn(item, selectedDate.date) : false;
}

function matchesSearch(item: FoodItem) {
	if (!filtersStore.searchQuery) return true;

	const query = filtersStore.searchQuery.toLowerCase();
	return (
		item.name.toLowerCase().includes(query) ||
		item.description?.toLowerCase().includes(query) ||
		item.restaurant?.toLowerCase().includes(query) ||
		false
	);
}

function matchesFilters(item: FoodItem) {
	if (!matchesSearch(item)) return false;

	if (
		filtersStore.selectedCategory !== "all" &&
		item.category !== filtersStore.selectedCategory
	) {
		return false;
	}

	if (
		filtersStore.selectedTags.size > 0 &&
		!Array.from(filtersStore.selectedTags).every((tag) => item.tags.includes(tag))
	) {
		return false;
	}

	if (
		item.price !== null &&
		(item.price < filtersStore.priceRange[0] ||
			item.price > filtersStore.priceRange[1])
	) {
		return false;
	}

	if (filtersStore.mobileOrderOnly && !item.mobileOrderAvailable) return false;

	if (
		filtersStore.selectedLocations.size > 0 &&
		(!item.location || !filtersStore.selectedLocations.has(item.location))
	) {
		return false;
	}

	if (
		filtersStore.selectedDates.size > 0 &&
		!Array.from(filtersStore.selectedDates).some((dateId) =>
			matchesSelectedDate(item, dateId),
		)
	) {
		return false;
	}

	return !filtersStore.favoritesOnly || favoritesStore.isFavorite(item.id);
}

const filteredItems = $derived(items.filter(matchesFilters));

const itemsByCategory = $derived.by(() => {
	return filteredItems.reduce(
		(acc, item) => {
			if (!acc[item.category]) acc[item.category] = [];
			acc[item.category].push(item);
			return acc;
		},
		{} as Record<string, FoodItem[]>,
	);
});

const sortedCategories = $derived.by(() =>
	Object.entries(itemsByCategory).sort(
		([catA], [catB]) =>
			(categoryRank.get(catA) ?? 999) - (categoryRank.get(catB) ?? 999),
	),
);

const activeFilterCount = $derived.by(() => {
	let count = 0;
	if (filtersStore.selectedCategory !== "all") count++;
	if (filtersStore.selectedTags.size > 0)
		count += filtersStore.selectedTags.size;
	if (!isDefaultPriceRange()) count++;
	if (filtersStore.mobileOrderOnly) count++;
	if (filtersStore.selectedDates.size > 0)
		count += filtersStore.selectedDates.size;
	if (filtersStore.selectedLocations.size > 0)
		count += filtersStore.selectedLocations.size;
	return count;
});

const activeFilters = $derived.by(() => {
	const filters: FilterItem[] = [];

	if (filtersStore.selectedCategory !== "all") {
		filters.push({
			id: "category",
			label: formatFilterLabel(filtersStore.selectedCategory),
			onRemove: () => {
				filtersStore.setSelectedCategory("all");
			},
		});
	}

	filtersStore.selectedLocations.forEach((location) => {
		filters.push({
			id: `location-${location}`,
			label: location,
			onRemove: () => {
				filtersStore.toggleLocation(location);
			},
		});
	});

	filtersStore.selectedDates.forEach((dateId) => {
		const date = dates.find((d) => d.id === dateId);
		if (date) {
			filters.push({
				id: `date-${dateId}`,
				label: `${date.label} ${date.name}`,
				onRemove: () => filtersStore.toggleDate(dateId),
			});
		}
	});

	if (!isDefaultPriceRange()) {
		filters.push({
			id: "price",
			label: `$${filtersStore.priceRange[0]}-$${filtersStore.priceRange[1]}`,
			onRemove: () => {
				filtersStore.setPriceRange([...DEFAULT_PRICE_RANGE]);
			},
		});
	}

	if (filtersStore.mobileOrderOnly) {
		filters.push({
			id: "mobile-order",
			label: "📱",
			onRemove: () => {
				filtersStore.setMobileOrderOnly(false);
			},
		});
	}

	filtersStore.selectedTags.forEach((tag) => {
		filters.push({
			id: `tag-${tag}`,
			label: formatFilterLabel(tag),
			onRemove: () => filtersStore.toggleTag(tag),
		});
	});

	return filters;
});

function handleItemClick(item: FoodItem) {
	selectedItem = item;
	detailDrawerOpen = true;
}
</script>

<div
    class="container mx-auto py-3 max-w-7xl"
    style="padding-left: max(env(safe-area-inset-left), 1rem); padding-right: max(env(safe-area-inset-right), 1rem); padding-bottom: calc(8rem + env(safe-area-inset-bottom)); padding-top: calc(0.75rem + env(safe-area-inset-top));"
>
    <header class="mt-3 mb-5">
        <div class="flex items-baseline justify-between gap-3">
            <h1
                class="font-display text-2xl uppercase leading-none text-foreground"
            >
                May the 4th
            </h1>
            {#if daysUntilMay4 !== null}
                <span
                    class="font-mono text-[0.7rem] tabular-nums uppercase tracking-[0.18em] text-muted-foreground shrink-0"
                    aria-label="Days until May the 4th"
                >
                    T−{daysUntilMay4}d
                </span>
            {/if}
        </div>
        <p
            class="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground/80 mt-1.5"
        >
            <span class="tabular-nums text-foreground/85"
                >{filteredItems.length}</span
            ><span class="opacity-50 mx-1">/</span><span
                class="tabular-nums">{metadata.totalItems}</span
            >
            <span class="ml-1">items</span>
            <span class="mx-1.5 opacity-40">·</span>
            <span>{metadata.filters.locations[0]}</span>
        </p>
    </header>

    <div bind:this={topSearchElement}>
        <SearchHeader>
            {#snippet filterSlot()}
                <FilterSheet
                    bind:open={filterSheetOpen}
                    {categories}
                    {allTags}
                    {locations}
                    {activeFilters}
                >
                    <Button
                        variant="outline"
                        class="relative text-muted-foreground"
                    >
                        <FilterIcon class=" h-4 w-4 mr-2" />
                        Filters
                        {#if activeFilterCount > 0}
                            <Badge
                                variant="secondary"
                                class="ml-2 rounded-full px-2"
                            >
                                {activeFilterCount}
                            </Badge>
                        {/if}
                    </Button>
                </FilterSheet>
            {/snippet}
        </SearchHeader>
    </div>

    <ItemDetailDrawer bind:open={detailDrawerOpen} item={selectedItem} />

    <div class="space-y-8">
        {#if filteredItems.length === 0}
            <Card.Root>
                <Card.Content class="text-center py-12">
                    <p class="text-muted-foreground text-lg">
                        No items match your filters. Try adjusting them!
                    </p>
                </Card.Content>
            </Card.Root>
        {:else}
            {#each sortedCategories as [category, categoryItems] (category)}
                <CategorySection
                    {category}
                    items={categoryItems}
                    onItemClick={handleItemClick}
                />
            {/each}
        {/if}
    </div>
</div>

<StickySearchBar {topSearchElement} />
