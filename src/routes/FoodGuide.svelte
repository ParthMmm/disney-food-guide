<script lang="ts">
import {
	ChevronDown,
	FilterIcon,
	Heart,
	LayoutGrid,
	List,
	Search,
	X,
} from "lucide-svelte";
import FoodImage from "$lib/components/FoodImage.svelte";
import { Badge } from "$lib/components/ui/badge";
import { Button } from "$lib/components/ui/button";
import * as Card from "$lib/components/ui/card";
import { Checkbox } from "$lib/components/ui/checkbox";
import * as Collapsible from "$lib/components/ui/collapsible";
import * as Drawer from "$lib/components/ui/drawer";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import * as Popover from "$lib/components/ui/popover";
import * as RadioGroup from "$lib/components/ui/radio-group";
import { ScrollArea } from "$lib/components/ui/scroll-area";
import * as Select from "$lib/components/ui/select";
import { Separator } from "$lib/components/ui/separator";
import * as Sheet from "$lib/components/ui/sheet";
import { Slider } from "$lib/components/ui/slider";
import { favoritesStore } from "$lib/stores/favorites.svelte";
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();

let searchQuery = $state("");
let selectedCategory = $state<string>("all");
let selectedTags: Set<string> = $state(new Set());
let priceRange = $state([1, 30]);
let mobileOrderOnly = $state(false);
let selectedDates: Set<string> = $state(new Set());
let selectedLocations: Set<string> = $state(new Set());
let filterSheetOpen = $state(false);
let favoritesOnly = $state(false);
let selectedItem = $state<(typeof items)[number] | null>(null);
let detailDrawerOpen = $state(false);
let viewMode = $state<"grid" | "condensed">("grid");
let openCategories = $state<Set<string>>(new Set());

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
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			const matchesSearch =
				item.name.toLowerCase().includes(query) ||
				item.description?.toLowerCase().includes(query) ||
				item.restaurant?.toLowerCase().includes(query);
			if (!matchesSearch) return false;
		}

		if (selectedCategory !== "all" && item.category !== selectedCategory) {
			return false;
		}

		if (selectedTags.size > 0) {
			const hasAllTags = Array.from(selectedTags).every((tag) =>
				item.tags.includes(tag),
			);
			if (!hasAllTags) return false;
		}

		if (item.price !== null) {
			if (item.price < priceRange[0] || item.price > priceRange[1]) {
				return false;
			}
		}

		if (mobileOrderOnly && !item.mobileOrderAvailable) {
			return false;
		}

		if (selectedLocations.size > 0) {
			if (!item.location || !selectedLocations.has(item.location)) {
				return false;
			}
		}

		if (selectedDates.size > 0) {
			const end = item.availability.endDate
				? new Date(item.availability.endDate)
				: null;

			if (!end) return false;

			const matchesAnyDate = Array.from(selectedDates).some((dateFilter) => {
				const cutoffDate =
					dateFilter === "halloween"
						? new Date("2025-10-31")
						: dateFilter === "thanksgiving"
							? new Date("2025-11-30")
							: new Date("2025-12-31");

				return end <= cutoffDate;
			});

			if (!matchesAnyDate) return false;
		}

		if (favoritesOnly && !favoritesStore.isFavorite(item.id)) {
			return false;
		}

		return true;
	});
});

function toggleTag(tag: string) {
	const newTags = new Set(selectedTags);
	if (newTags.has(tag)) {
		newTags.delete(tag);
	} else {
		newTags.add(tag);
	}
	selectedTags = newTags;
}

function toggleDate(dateId: string) {
	const newDates = new Set(selectedDates);
	if (newDates.has(dateId)) {
		newDates.delete(dateId);
	} else {
		newDates.add(dateId);
	}
	selectedDates = newDates;
}

function toggleCategory(category: string) {
	const newCategories = new Set(openCategories);
	if (newCategories.has(category)) {
		newCategories.delete(category);
	} else {
		newCategories.add(category);
	}
	openCategories = newCategories;
}

function clearFilters() {
	searchQuery = "";
	selectedCategory = "all";
	selectedTags = new Set();
	priceRange = [0, 30];
	mobileOrderOnly = false;
	selectedDates = new Set();
	selectedLocations = new Set();
}

const itemsByCategory = $derived.by(() => {
	return filteredItems.reduce(
		(acc, item) => {
			if (!acc[item.category]) acc[item.category] = [];
			acc[item.category].push(item);
			return acc;
		},
		{} as Record<string, typeof items>,
	);
});

const activeFilterCount = $derived.by(() => {
	let count = 0;
	if (selectedCategory !== "all") count++;
	if (selectedTags.size > 0) count += selectedTags.size;
	if (priceRange[0] !== 1 || priceRange[1] !== 30) count++;
	if (mobileOrderOnly) count++;
	if (selectedDates.size > 0) count += selectedDates.size;
	if (selectedLocations.size > 0) count += selectedLocations.size;
	return count;
});

const activeFilters = $derived.by(() => {
	const filters: Array<{
		id: string;
		label: string;
		onRemove: () => void;
	}> = [];

	if (selectedCategory !== "all") {
		filters.push({
			id: "category",
			label: selectedCategory
				.replace(/-/g, " ")
				.replace(/\b\w/g, (l) => l.toUpperCase()),
			onRemove: () => {
				selectedCategory = "all";
			},
		});
	}

	if (selectedLocations.has("Disneyland")) {
		filters.push({
			id: "location-disneyland",
			label: "🏰 Disneyland",
			onRemove: () => {
				const newLocations = new Set(selectedLocations);
				newLocations.delete("Disneyland");
				selectedLocations = newLocations;
			},
		});
	}

	if (selectedLocations.has("California Adventure")) {
		filters.push({
			id: "location-dca",
			label: "🎡 California Adventure",
			onRemove: () => {
				const newLocations = new Set(selectedLocations);
				newLocations.delete("California Adventure");
				selectedLocations = newLocations;
			},
		});
	}

	selectedDates.forEach((dateId) => {
		const date = dates.find((d) => d.id === dateId);
		if (date) {
			filters.push({
				id: `date-${dateId}`,
				label: `${date.label} ${date.name}`,
				onRemove: () => toggleDate(dateId),
			});
		}
	});

	if (priceRange[0] !== 1 || priceRange[1] !== 30) {
		filters.push({
			id: "price",
			label: `$${priceRange[0]}-$${priceRange[1]}`,
			onRemove: () => {
				priceRange = [1, 30];
			},
		});
	}

	if (mobileOrderOnly) {
		filters.push({
			id: "mobile-order",
			label: "📱",
			onRemove: () => {
				mobileOrderOnly = false;
			},
		});
	}

	selectedTags.forEach((tag) => {
		filters.push({
			id: `tag-${tag}`,
			label: tag.replace(/-/g, " "),
			onRemove: () => toggleTag(tag),
		});
	});

	return filters;
});
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

    <div class="mb-6 flex flex-col gap-3">
        <div class="relative flex-1">
            <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
                type="text"
                placeholder="Search..."
                bind:value={searchQuery}
                class="pl-9"
            />
        </div>
        <div>
            <Button
                variant="outline"
                onclick={() =>
                    (viewMode = viewMode === "grid" ? "condensed" : "grid")}
            >
                {#if viewMode === "grid"}
                    <List class="h-4 w-4" />
                {:else}
                    <LayoutGrid class="h-4 w-4" />
                {/if}
            </Button>
            <Button
                variant={favoritesOnly ? "default" : "outline"}
                onclick={() => (favoritesOnly = !favoritesOnly)}
            >
                <Heart class="h-4 w-4  {favoritesOnly ? 'fill-current' : ''}" />
            </Button>

            <Drawer.Root bind:open={filterSheetOpen}>
                <Drawer.Trigger>
                    <Button variant="outline" class="relative">
                        <FilterIcon class="h-4 w-4 mr-2" />
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
                </Drawer.Trigger>
                <Drawer.Content
                    class="w-full sm:max-w-2xl p-0 max-h-[95vh] flex flex-col"
                >
                    <Drawer.Header>
                        <Drawer.Title class="text-center">Filters</Drawer.Title>
                        {#if activeFilters.length > 0}
                            <Drawer.Description
                                class="flex flex-wrap gap-2 mt-2"
                            >
                                {#each activeFilters as filter (filter.id)}
                                    <Badge
                                        variant="outline"
                                        class="gap-1.5 border border-ring/50 bg-primary/25"
                                    >
                                        <span>{filter.label}</span>
                                        <button
                                            onclick={(e) => {
                                                e.stopPropagation();
                                                filter.onRemove();
                                            }}
                                            class="ml-0.5 hover:bg-muted rounded-sm"
                                            aria-label="Remove filter"
                                        >
                                            <X class="h-3 w-3" />
                                        </button>
                                    </Badge>
                                {/each}
                            </Drawer.Description>
                        {/if}
                    </Drawer.Header>

                    <div
                        class="flex-1 overflow-y-auto -mx-4 px-4"
                        style="touch-action: pan-y;"
                    >
                        <div class="space-y-3 pb-4">
                            <div class="space-y-3">
                                <h3 class="font-semibold">Category</h3>
                                <select
                                    bind:value={selectedCategory}
                                    class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="all">All Categories</option>
                                    {#each categories as category}
                                        <option value={category}>
                                            {category
                                                .replace(/-/g, " ")
                                                .replace(/\b\w/g, (l) =>
                                                    l.toUpperCase(),
                                                )}
                                        </option>
                                    {/each}
                                </select>
                            </div>

                            <!-- <Separator /> -->

                            <div class="space-y-3">
                                <h3 class="font-semibold">Park Location</h3>
                                <div class="flex">
                                    <button
                                        onclick={() => {
                                            const newLocations = new Set(
                                                selectedLocations,
                                            );
                                            if (
                                                newLocations.has("Disneyland")
                                            ) {
                                                newLocations.delete(
                                                    "Disneyland",
                                                );
                                            } else {
                                                newLocations.add("Disneyland");
                                            }
                                            selectedLocations = newLocations;
                                        }}
                                        class="flex-1 flex items-center justify-center h-12 px-4 transition-all border
                                       first:rounded-l-lg
                                       {selectedLocations.has('Disneyland')
                                            ? 'bg-primary/25 text-primary-foreground border-primary z-10'
                                            : 'bg-background hover:bg-accent border-input'}"
                                    >
                                        <span class="text-2xl">🏰</span>
                                    </button>
                                    <button
                                        onclick={() => {
                                            const newLocations = new Set(
                                                selectedLocations,
                                            );
                                            if (
                                                newLocations.has(
                                                    "California Adventure",
                                                )
                                            ) {
                                                newLocations.delete(
                                                    "California Adventure",
                                                );
                                            } else {
                                                newLocations.add(
                                                    "California Adventure",
                                                );
                                            }
                                            selectedLocations = newLocations;
                                        }}
                                        class="flex-1 flex items-center justify-center h-12 px-4 transition-all border
                                       -ml-px last:rounded-r-lg
                                       {selectedLocations.has(
                                            'California Adventure',
                                        )
                                            ? 'bg-primary/25 text-primary-foreground border-primary z-10'
                                            : 'bg-background hover:bg-accent border-input'}"
                                    >
                                        <span class="text-2xl">🎡</span>
                                    </button>
                                </div>
                            </div>

                            <!-- <Separator /> -->

                            <div class="space-y-3">
                                <h3 class="font-semibold">Available On Date</h3>
                                <div class="flex">
                                    {#each dates as date (date.id)}
                                        <button
                                            onclick={() => toggleDate(date.id)}
                                            class="flex-1 flex items-center justify-center h-12 px-4 transition-all border
                                           -ml-px first:ml-0 first:rounded-l-lg last:rounded-r-lg
                                           {selectedDates.has(date.id)
                                                ? 'bg-primary/25 text-primary-foreground border-primary z-10'
                                                : 'bg-background hover:bg-accent border-input'}"
                                        >
                                            <span class="text-2xl"
                                                >{date.label}</span
                                            >
                                        </button>
                                    {/each}
                                </div>
                            </div>

                            <!-- <Separator /> -->

                            <div class="space-y-3">
                                <h3 class="font-semibold">
                                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                                </h3>
                                <Slider
                                    type="multiple"
                                    bind:value={priceRange}
                                    min={1}
                                    max={30}
                                    step={1}
                                    class=""
                                />
                            </div>

                            <!-- <Separator /> -->

                            <!-- <div class="space-y-3">
                            <div class="flex items-center space-x-2">
                                <Checkbox
                                    id="mobile-order"
                                    bind:checked={mobileOrderOnly}
                                />
                                <label
                                    for="mobile-order"
                                    class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >📱
                                </label>
                            </div>
                        </div> -->

                            <Separator />

                            <div class="space-y-3">
                                <h3 class="font-semibold">Tags</h3>
                                <ScrollArea class="h-64">
                                    <div class="flex flex-wrap gap-2 pr-4">
                                        {#each allTags as tag}
                                            <button
                                                onclick={() => toggleTag(tag)}
                                                class="inline-flex items-center rounded-full border px-3 py-1 text-xs transition-colors {selectedTags.has(
                                                    tag,
                                                )
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-background hover:bg-accent'}"
                                            >
                                                {tag.replace(/-/g, " ")}
                                            </button>
                                        {/each}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-2 pt-4 border-t">
                        <Button
                            onclick={clearFilters}
                            variant="outline"
                            class="flex-1"
                        >
                            <X class="h-4 w-4 mr-2" />
                            Clear All
                        </Button>
                        <Button
                            onclick={() => (filterSheetOpen = false)}
                            class="flex-1"
                        >
                            Apply
                        </Button>
                    </div>
                </Drawer.Content>
            </Drawer.Root>
        </div>
    </div>

    <Drawer.Root bind:open={detailDrawerOpen}>
        <Drawer.Content
            class="w-full sm:max-w-2xl p-0 max-h-[95vh] flex flex-col"
        >
            {#if selectedItem}
                <div
                    class="flex-1 overflow-y-auto"
                    style="touch-action: pan-y;"
                >
                    <FoodImage
                        src={selectedItem.imageUrl}
                        alt={selectedItem.name}
                        name={selectedItem.name}
                        description={selectedItem.description}
                        category={selectedItem.category}
                        itemType={selectedItem.itemType}
                        class="w-full h-64 object-cover"
                    />

                    <div class="p-6 space-y-4">
                        <Drawer.Header class="p-0">
                            <Drawer.Title class="text-3xl"
                                >{selectedItem.name}</Drawer.Title
                            >
                            {#if selectedItem.description}
                                <Drawer.Description class="text-base mt-2">
                                    {selectedItem.description}
                                </Drawer.Description>
                            {/if}
                        </Drawer.Header>

                        <div class="flex items-center gap-4 flex-wrap">
                            {#if selectedItem.price}
                                <span class="text-3xl font-bold text-primary">
                                    ${selectedItem.price.toFixed(2)}
                                </span>
                            {/if}
                            {#if selectedItem.mobileOrderAvailable}
                                <Badge
                                    variant="outline"
                                    class="text-base px-3 py-1">📱</Badge
                                >
                            {/if}
                            <button
                                onclick={(e) => {
                                    e.stopPropagation();
                                    if (selectedItem)
                                        favoritesStore.toggle(selectedItem.id);
                                }}
                                class="ml-auto p-2 rounded-full hover:bg-accent transition-colors"
                                aria-label="Toggle favorite"
                            >
                                <Heart
                                    class="h-6 w-6 transition-colors {selectedItem &&
                                    favoritesStore.isFavorite(selectedItem.id)
                                        ? 'fill-red-500 stroke-red-500'
                                        : 'stroke-foreground'}"
                                />
                            </button>
                        </div>

                        <Separator />

                        <div class="space-y-3">
                            {#if selectedItem.restaurant}
                                <div>
                                    <h3
                                        class="text-sm font-semibold text-muted-foreground mb-1"
                                    >
                                        Location
                                    </h3>
                                    <p class="text-base">
                                        📍 {selectedItem.restaurant}
                                    </p>
                                    {#if selectedItem.location}
                                        <p
                                            class="text-sm text-muted-foreground"
                                        >
                                            {selectedItem.location}
                                        </p>
                                    {/if}
                                </div>
                            {/if}

                            {#if selectedItem.availability.startDate && selectedItem.availability.endDate}
                                {@const start = new Date(
                                    selectedItem.availability.startDate,
                                )}
                                {@const end = new Date(
                                    selectedItem.availability.endDate,
                                )}
                                <div>
                                    <h3
                                        class="text-sm font-semibold text-muted-foreground mb-1"
                                    >
                                        Availability
                                    </h3>
                                    <p class="text-base">
                                        {start.toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })} - {end.toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                    <div class="flex flex-wrap gap-2 mt-2">
                                        {#if start <= new Date("2025-10-31") && end >= new Date("2025-10-31")}
                                            <Badge
                                                variant="secondary"
                                                class="text-base">🎃</Badge
                                            >
                                        {/if}
                                        {#if start <= new Date("2025-11-30") && end >= new Date("2025-11-30")}
                                            <Badge
                                                variant="secondary"
                                                class="text-base">🦃</Badge
                                            >
                                        {/if}
                                        {#if start <= new Date("2025-12-31") && end >= new Date("2025-12-31")}
                                            <Badge
                                                variant="secondary"
                                                class="text-base">🎄</Badge
                                            >
                                        {/if}
                                    </div>
                                </div>
                            {/if}

                            {#if selectedItem.tags.length > 0}
                                <div>
                                    <h3
                                        class="text-sm font-semibold text-muted-foreground mb-2"
                                    >
                                        Tags
                                    </h3>
                                    <div class="flex flex-wrap gap-2">
                                        {#each selectedItem.tags as tag}
                                            <Badge
                                                variant="outline"
                                                class="text-sm"
                                            >
                                                {tag.replace(/-/g, " ")}
                                            </Badge>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>

                <div class="p-4 border-t">
                    <Button
                        onclick={() => (detailDrawerOpen = false)}
                        class="w-full"
                    >
                        Close
                    </Button>
                </div>
            {/if}
        </Drawer.Content>
    </Drawer.Root>

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
                {#if viewMode === "condensed"}
                    <Collapsible.Root
                        open={!openCategories.has(category)}
                        onOpenChange={() => toggleCategory(category)}
                    >
                        <Collapsible.Trigger
                            class="flex items-center gap-3 w-full hover:opacity-75 transition-opacity"
                        >
                            <h2 class="text-2xl font-bold">
                                {category
                                    .replace(/-/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </h2>
                            <Badge variant="secondary"
                                >{categoryItems.length}</Badge
                            >
                            <ChevronDown
                                class="h-5 w-5 transition-transform {openCategories.has(
                                    category,
                                )
                                    ? ''
                                    : 'rotate-180'}"
                            />
                        </Collapsible.Trigger>

                        <Collapsible.Content>
                            <div class="flex flex-col gap-2 mt-4">
                                {#each categoryItems as item}
                            {@const cardClass = "overflow-hidden hover:shadow-md transition-shadow relative cursor-pointer flex flex-row items-start gap-3 p-3"}
                            {@const heartButtonClass = "absolute top-[5%] left-10 z-10 p-1.5 rounded-full bg-background/25 backdrop-blur-sm hover:bg-background transition-colors"}
                            {@const heartIconClass = `h-4 w-4 transition-colors ${favoritesStore.isFavorite(item.id) ? "fill-orange-500 stroke-orange-500" : "stroke-foreground"}`}
                            {@const imageClass = "item-image-condensed"}
                            <Card.Root
                                class={cardClass}
                                onclick={() => {
                                    selectedItem = item;
                                    detailDrawerOpen = true;
                                }}
                            >
                                <button
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        favoritesStore.toggle(item.id);
                                    }}
                                    class={heartButtonClass}
                                    aria-label="Toggle favorite"
                                >
                                    <Heart class={heartIconClass} />
                                </button>

                                <FoodImage
                                    src={item.imageUrl}
                                    alt={item.name}
                                    name={item.name}
                                    description={item.description}
                                    category={item.category}
                                    itemType={item.itemType}
                                    class={imageClass}
                                />

                                {#if viewMode === "grid"}
                                    <Card.Header>
                                        <Card.Title class="line-clamp-2"
                                            >{item.name}</Card.Title
                                        >
                                        {#if item.description}
                                            <Card.Description
                                                class="line-clamp-1"
                                            >
                                                {item.description}
                                            </Card.Description>
                                        {/if}
                                    </Card.Header>

                                    <Card.Content class="space-y-3">
                                        <div
                                            class="flex items-center justify-between"
                                        >
                                            {#if item.price}
                                                <span
                                                    class="text-2xl font-bold text-primary"
                                                >
                                                    ${item.price.toFixed(2)}
                                                </span>
                                            {/if}
                                            {#if item.mobileOrderAvailable}
                                                <Badge
                                                    variant="outline"
                                                    class="border-0">📱</Badge
                                                >
                                            {/if}
                                        </div>

                                        {#if item.restaurant}
                                            <p
                                                class="text-sm text-muted-foreground"
                                            >
                                                📍 {item.restaurant}
                                            </p>
                                        {/if}

                                        <div class="flex flex-wrap gap-1">
                                            {#each item.tags.slice(0, 4) as tag}
                                                <Badge
                                                    variant="outline"
                                                    class="text-xs"
                                                >
                                                    {tag.replace(/-/g, " ")}
                                                </Badge>
                                            {/each}
                                            {#if item.tags.length > 4}
                                                <Popover.Root>
                                                    <Popover.Trigger>
                                                        <Badge
                                                            variant="outline"
                                                            class="text-xs"
                                                        >
                                                            +{item.tags.length -
                                                                4}
                                                        </Badge>
                                                    </Popover.Trigger>
                                                    <Popover.Content
                                                        class="w-auto p-3"
                                                    >
                                                        <div
                                                            class="flex flex-wrap gap-1 max-w-xs"
                                                        >
                                                            {#each item.tags.slice(4) as tag}
                                                                <Badge
                                                                    variant="outline"
                                                                    class="text-xs"
                                                                >
                                                                    {tag.replace(
                                                                        /-/g,
                                                                        " ",
                                                                    )}
                                                                </Badge>
                                                            {/each}
                                                        </div>
                                                    </Popover.Content>
                                                </Popover.Root>
                                            {/if}
                                        </div>

                                        {#if item.availability.startDate && item.availability.endDate}
                                            {@const start = new Date(
                                                item.availability.startDate,
                                            )}
                                            {@const end = new Date(
                                                item.availability.endDate,
                                            )}
                                            <div class="flex item-start gap-3">
                                                <span>
                                                    {#if start <= new Date("2025-10-31") && end >= new Date("2025-10-31")}🎃{/if}
                                                </span>
                                                <span>
                                                    {#if start <= new Date("2025-11-30") && end >= new Date("2025-11-30")}🦃{/if}
                                                </span>
                                                <span>
                                                    {#if start <= new Date("2025-12-31") && end >= new Date("2025-12-31")}🎄{/if}
                                                </span>
                                            </div>
                                        {/if}
                                    </Card.Content>
                                {:else}
                                    <div class="flex-1 min-w-0 space-y-1">
                                        <div class="flex items-start gap-2">
                                            <h3
                                                class="font-semibold text-sm line-clamp-1 flex-1"
                                            >
                                                {item.name}
                                            </h3>
                                            {#if item.price}
                                                <span
                                                    class="text-sm font-bold text-primary whitespace-nowrap"
                                                >
                                                    ${item.price.toFixed(2)}
                                                </span>
                                            {/if}
                                        </div>
                                        {#if item.description}
                                            <p
                                                class="text-xs text-muted-foreground line-clamp-1"
                                            >
                                                {item.description}
                                            </p>
                                        {/if}
                                        <div
                                            class="flex items-center gap-2 flex-wrap"
                                        >
                                            {#if item.restaurant}
                                                <span
                                                    class="text-xs text-muted-foreground"
                                                    >📍 {item.restaurant}</span
                                                >
                                            {/if}
                                            {#if item.mobileOrderAvailable}
                                                <span class="text-xs">📱</span>
                                            {/if}
                                            {#if item.availability.startDate && item.availability.endDate}
                                                {@const start = new Date(
                                                    item.availability.startDate,
                                                )}
                                                {@const end = new Date(
                                                    item.availability.endDate,
                                                )}
                                                <div class="flex gap-1">
                                                    {#if start <= new Date("2025-10-31") && end >= new Date("2025-10-31")}🎃{/if}
                                                    {#if start <= new Date("2025-11-30") && end >= new Date("2025-11-30")}🦃{/if}
                                                    {#if start <= new Date("2025-12-31") && end >= new Date("2025-12-31")}🎄{/if}
                                                </div>
                                            {/if}
                                        </div>
                                    </div>
                                {/if}
                            </Card.Root>
                                {/each}
                            </div>
                        </Collapsible.Content>
                    </Collapsible.Root>
                {:else}
                    <section class="space-y-4">
                        <div class="flex items-center gap-3">
                            <h2 class="text-2xl font-bold">
                                {category
                                    .replace(/-/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </h2>
                            <Badge variant="secondary">{categoryItems.length}</Badge
                            >
                        </div>

                        <div class="grid grid-cols-1 gap-4">
                            {#each categoryItems as item}
                                {@const cardClass = "pt-0 overflow-hidden hover:shadow-lg transition-shadow relative cursor-pointer"}
                                {@const heartButtonClass = "absolute top-3 right-3 z-10 p-2 rounded-full bg-background/25 backdrop-blur-sm hover:bg-background transition-colors"}
                                {@const heartIconClass = `h-5 w-5 transition-colors ${favoritesStore.isFavorite(item.id) ? "fill-orange-500 stroke-orange-500" : "stroke-foreground"}`}
                                {@const imageClass = "item-image"}
                                <Card.Root
                                    class={cardClass}
                                    onclick={() => {
                                        selectedItem = item;
                                        detailDrawerOpen = true;
                                    }}
                                >
                                    <button
                                        onclick={(e) => {
                                            e.stopPropagation();
                                            favoritesStore.toggle(item.id);
                                        }}
                                        class={heartButtonClass}
                                        aria-label="Toggle favorite"
                                    >
                                        <Heart class={heartIconClass} />
                                    </button>

                                    <FoodImage
                                        src={item.imageUrl}
                                        alt={item.name}
                                        name={item.name}
                                        description={item.description}
                                        category={item.category}
                                        itemType={item.itemType}
                                        class={imageClass}
                                    />

                                    <Card.Header>
                                        <Card.Title class="line-clamp-2"
                                            >{item.name}</Card.Title
                                        >
                                        {#if item.description}
                                            <Card.Description
                                                class="line-clamp-1"
                                            >
                                                {item.description}
                                            </Card.Description>
                                        {/if}
                                    </Card.Header>

                                    <Card.Content class="space-y-3">
                                        <div
                                            class="flex items-center justify-between"
                                        >
                                            {#if item.price}
                                                <span
                                                    class="text-2xl font-bold text-primary"
                                                >
                                                    ${item.price.toFixed(2)}
                                                </span>
                                            {/if}
                                            {#if item.mobileOrderAvailable}
                                                <Badge
                                                    variant="outline"
                                                    class="border-0">📱</Badge
                                                >
                                            {/if}
                                        </div>

                                        {#if item.restaurant}
                                            <p
                                                class="text-sm text-muted-foreground"
                                            >
                                                📍 {item.restaurant}
                                            </p>
                                        {/if}

                                        <div class="flex flex-wrap gap-1">
                                            {#each item.tags.slice(0, 4) as tag}
                                                <Badge
                                                    variant="outline"
                                                    class="text-xs"
                                                >
                                                    {tag.replace(/-/g, " ")}
                                                </Badge>
                                            {/each}
                                            {#if item.tags.length > 4}
                                                <Popover.Root>
                                                    <Popover.Trigger>
                                                        <Badge
                                                            variant="outline"
                                                            class="text-xs"
                                                        >
                                                            +{item.tags.length -
                                                                4}
                                                        </Badge>
                                                    </Popover.Trigger>
                                                    <Popover.Content
                                                        class="w-auto p-3"
                                                    >
                                                        <div
                                                            class="flex flex-wrap gap-1 max-w-xs"
                                                        >
                                                            {#each item.tags.slice(4) as tag}
                                                                <Badge
                                                                    variant="outline"
                                                                    class="text-xs"
                                                                >
                                                                    {tag.replace(
                                                                        /-/g,
                                                                        " ",
                                                                    )}
                                                                </Badge>
                                                            {/each}
                                                        </div>
                                                    </Popover.Content>
                                                </Popover.Root>
                                            {/if}
                                        </div>

                                        {#if item.availability.startDate && item.availability.endDate}
                                            {@const start = new Date(
                                                item.availability.startDate,
                                            )}
                                            {@const end = new Date(
                                                item.availability.endDate,
                                            )}
                                            <div class="flex item-start gap-3">
                                                <span>
                                                    {#if start <= new Date("2025-10-31") && end >= new Date("2025-10-31")}🎃{/if}
                                                </span>
                                                <span>
                                                    {#if start <= new Date("2025-11-30") && end >= new Date("2025-11-30")}🦃{/if}
                                                </span>
                                                <span>
                                                    {#if start <= new Date("2025-12-31") && end >= new Date("2025-12-31")}🎄{/if}
                                                </span>
                                            </div>
                                        {/if}
                                    </Card.Content>
                                </Card.Root>
                            {/each}
                        </div>
                    </section>
                {/if}
            {/each}
        {/if}
    </div>
</div>

<style>
    :global(.item-image) {
        width: 100%;
        height: 200px;
        object-fit: cover;
    }

    :global(.item-image-condensed) {
        /*width: 80px;
        height: 80px;
        object-fit: cover;
        flex-shrink: 0;
        border-radius: 0.5rem;*/
        width: 80px;
        height: 100px;
        object-fit: cover;
        flex-shrink: 0;
        /*margin-left: -10px;*/
        /*margin-top: -10px;*/
        margin: -14px 0 -14px -14px;
    }
</style>
