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
import { favoritesStore } from "$lib/stores/favorites.svelte";
import { filtersStore } from "$lib/stores/filters.svelte";
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();

let filterSheetOpen = $state(false);
let selectedItem = $state<FoodItem | null>(null);
let detailDrawerOpen = $state(false);

const { metadata, items } = data.foodData;
const categories = metadata.filters.categories;
const allTags = metadata.filters.allTags;

const dates = [
	{
		id: "halloween",
		name: "Halloween",
		label: "🎃",
	},
	{
		id: "thanksgiving",
		name: "Thanksgiving",
		label: "🦃",
	},
	{
		id: "christmas",
		name: "Christmas",
		label: "🎄",
	},
];

const filteredItems = $derived.by(() => {
	return items.filter((item) => {
		if (filtersStore.searchQuery) {
			const query = filtersStore.searchQuery.toLowerCase();
			const matchesSearch =
				item.name.toLowerCase().includes(query) ||
				item.description?.toLowerCase().includes(query) ||
				item.restaurant?.toLowerCase().includes(query);
			if (!matchesSearch) return false;
		}

		if (
			filtersStore.selectedCategory !== "all" &&
			item.category !== filtersStore.selectedCategory
		) {
			return false;
		}

		if (filtersStore.selectedTags.size > 0) {
			const hasAllTags = Array.from(filtersStore.selectedTags).every((tag) =>
				item.tags.includes(tag),
			);
			if (!hasAllTags) return false;
		}

		if (item.price !== null) {
			if (
				item.price < filtersStore.priceRange[0] ||
				item.price > filtersStore.priceRange[1]
			) {
				return false;
			}
		}

		if (filtersStore.mobileOrderOnly && !item.mobileOrderAvailable) {
			return false;
		}

		if (filtersStore.selectedLocations.size > 0) {
			if (
				!item.location ||
				!filtersStore.selectedLocations.has(item.location)
			) {
				return false;
			}
		}

		if (filtersStore.selectedDates.size > 0) {
			const end = item.availability.endDate
				? new Date(item.availability.endDate)
				: null;

			if (!end) return false;

			const matchesAnyDate = Array.from(filtersStore.selectedDates).some(
				(dateFilter) => {
					const cutoffDate =
						dateFilter === "halloween"
							? new Date("2025-10-31")
							: dateFilter === "thanksgiving"
								? new Date("2025-11-30")
								: new Date("2025-12-31");

					return end <= cutoffDate;
				},
			);

			if (!matchesAnyDate) return false;
		}

		if (filtersStore.favoritesOnly && !favoritesStore.isFavorite(item.id)) {
			return false;
		}

		return true;
	});
});

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

const activeFilterCount = $derived.by(() => {
	let count = 0;
	if (filtersStore.selectedCategory !== "all") count++;
	if (filtersStore.selectedTags.size > 0)
		count += filtersStore.selectedTags.size;
	if (filtersStore.priceRange[0] !== 1 || filtersStore.priceRange[1] !== 30)
		count++;
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
			label: filtersStore.selectedCategory
				.replace(/-/g, " ")
				.replace(/\b\w/g, (l) => l.toUpperCase()),
			onRemove: () => {
				filtersStore.setSelectedCategory("all");
			},
		});
	}

	if (filtersStore.selectedLocations.has("Disneyland")) {
		filters.push({
			id: "location-disneyland",
			label: "🏰 Disneyland",
			onRemove: () => {
				filtersStore.toggleLocation("Disneyland");
			},
		});
	}

	if (filtersStore.selectedLocations.has("California Adventure")) {
		filters.push({
			id: "location-dca",
			label: "🎡 California Adventure",
			onRemove: () => {
				filtersStore.toggleLocation("California Adventure");
			},
		});
	}

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

	if (filtersStore.priceRange[0] !== 1 || filtersStore.priceRange[1] !== 30) {
		filters.push({
			id: "price",
			label: `$${filtersStore.priceRange[0]}-$${filtersStore.priceRange[1]}`,
			onRemove: () => {
				filtersStore.setPriceRange([1, 30]);
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
			label: tag.replace(/-/g, " "),
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

<div class="container mx-auto px-4 py-6 max-w-7xl">
	<header class="text-center mb-8">
		<h1 class="text-4xl font-bold mb-2">
			🎃 Disneyland Halloween Food Guide 2025
		</h1>
		<p class="text-muted-foreground">
			<span class="text-primary">{filteredItems.length} </span> / {metadata.totalItems}
		</p>
	</header>

	<SearchHeader>
		{#snippet filterSlot()}
			<FilterSheet
				bind:open={filterSheetOpen}
				{categories}
				{allTags}
				{activeFilters}
			>
				<Button variant="outline" class="relative">
					<FilterIcon class="h-4 w-4 mr-2" />
					Filters
					{#if activeFilterCount > 0}
						<Badge variant="secondary" class="ml-2 rounded-full px-2">
							{activeFilterCount}
						</Badge>
					{/if}
				</Button>
			</FilterSheet>
		{/snippet}
	</SearchHeader>

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
			{#each Object.entries(itemsByCategory) as [category, categoryItems]}
				<CategorySection
					{category}
					items={categoryItems}
					onItemClick={handleItemClick}
				/>
			{/each}
		{/if}
	</div>
</div>
