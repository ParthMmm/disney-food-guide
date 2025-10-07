<script lang="ts" module>
import type { FoodItem } from "$lib/types/types";
</script>

<script lang="ts">
import { Heart } from "lucide-svelte";
import FoodImage from "$lib/components/FoodImage.svelte";
import { Badge } from "$lib/components/ui/badge";
import * as Card from "$lib/components/ui/card";
import * as Popover from "$lib/components/ui/popover";
import { favoritesStore } from "$lib/stores/favorites.svelte";
import { viewPreferencesStore } from "$lib/stores/viewPreferences.svelte";

let {
	item,
	onclick,
}: {
	item: FoodItem;
	onclick?: () => void;
} = $props();

const isCondensed = $derived(viewPreferencesStore.viewMode === "condensed");

const cardClass = $derived(
	isCondensed
		? "overflow-hidden hover:shadow-md transition-shadow relative cursor-pointer flex flex-row items-start gap-3 p-3"
		: "pt-0 overflow-hidden hover:shadow-lg transition-shadow relative cursor-pointer",
);

const heartButtonClass = $derived(
	isCondensed
		? "absolute top-[5%] left-10 z-10 p-1.5 rounded-full bg-background/25 backdrop-blur-sm hover:bg-background transition-colors"
		: "absolute top-3 right-3 z-10 p-2 rounded-full bg-background/25 backdrop-blur-sm hover:bg-background transition-colors",
);

const heartIconClass = $derived(
	isCondensed
		? `h-4 w-4 transition-colors ${favoritesStore.isFavorite(item.id) ? "fill-orange-500 stroke-orange-500" : "stroke-foreground"}`
		: `h-5 w-5 transition-colors ${favoritesStore.isFavorite(item.id) ? "fill-orange-500 stroke-orange-500" : "stroke-foreground"}`,
);

const imageClass = $derived(
	isCondensed ? "item-image-condensed" : "item-image",
);
</script>

<Card.Root class={cardClass} {onclick}>
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

	{#if isCondensed}
		<div class="flex flex-col w-full min-w-0 space-y-1">
			<div class="flex items-center justify-between gap-2 w-full pr-2">
				<h3 class="font-semibold text-sm line-clamp-1 flex-1">
					{item.name}
				</h3>
				{#if item.price}
					<span
						class="text-sm font-bold text-primary whitespace-nowrap tabular-nums shrink-0"
					>
						${item.price.toFixed(0)}
					</span>
				{/if}
			</div>

			<div class="flex items-center gap-2 flex-wrap">
				{#if item.restaurant}
					<span class="text-xs text-muted-foreground"
						>📍 {item.restaurant}</span
					>
				{/if}
				{#if item.mobileOrderAvailable}
					<span class="text-xs">📱</span>
				{/if}
			</div>

			<div>
				{#if item.availability.startDate && item.availability.endDate}
					{@const start = new Date(item.availability.startDate)}
					{@const end = new Date(item.availability.endDate)}
					<div class="flex gap-1">
						{#if start <= new Date("2025-10-31") && end >= new Date("2025-10-31")}🎃{/if}
						{#if start <= new Date("2025-11-30") && end >= new Date("2025-11-30")}🦃{/if}
						{#if start <= new Date("2025-12-31") && end >= new Date("2025-12-31")}🎄{/if}
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<Card.Header>
			<div class="flex justify-between items-center">
				<Card.Title class="line-clamp-2">{item.name}</Card.Title>
				{#if item.price}
					<span class="text-xl tabular-nums font-bold text-primary">
						${item.price.toFixed(2)}
					</span>
				{/if}
			</div>
			{#if item.description}
				<Card.Description class="line-clamp-3">
					{item.description}
				</Card.Description>
			{/if}
		</Card.Header>

		<Card.Content class="space-y-3">
			<div class="flex items-center justify-between">
				{#if item.mobileOrderAvailable}
					<Badge variant="outline" class="border-0">📱</Badge>
				{/if}
			</div>

			{#if item.restaurant}
				<p class="text-sm text-muted-foreground">📍 {item.restaurant}</p>
			{/if}

			<div class="flex flex-wrap gap-1">
				{#each item.tags.slice(0, 4) as tag}
					<Badge variant="outline" class="text-xs">
						{tag.replace(/-/g, " ")}
					</Badge>
				{/each}
				{#if item.tags.length > 4}
					<Popover.Root>
						<Popover.Trigger>
							<Badge variant="outline" class="text-xs">
								+{item.tags.length - 4}
							</Badge>
						</Popover.Trigger>
						<Popover.Content class="w-auto p-3">
							<div class="flex flex-wrap gap-1 max-w-xs">
								{#each item.tags.slice(4) as tag}
									<Badge variant="outline" class="text-xs">
										{tag.replace(/-/g, " ")}
									</Badge>
								{/each}
							</div>
						</Popover.Content>
					</Popover.Root>
				{/if}
			</div>

			{#if item.availability.startDate && item.availability.endDate}
				{@const start = new Date(item.availability.startDate)}
				{@const end = new Date(item.availability.endDate)}
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
	{/if}
</Card.Root>

<style>
	:global(.item-image) {
		width: 100%;
		height: 200px;
		object-fit: cover;
	}

	:global(.item-image-condensed) {
		width: 80px;
		height: 100px;
		object-fit: cover;
		flex-shrink: 0;
		margin: -14px 0 -14px -14px;
	}
</style>
