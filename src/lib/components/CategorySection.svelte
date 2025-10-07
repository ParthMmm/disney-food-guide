<script lang="ts" module>
import type { FoodItem } from "$lib/types/types";
</script>

<script lang="ts">
import { ChevronDown } from "lucide-svelte";
import { slide } from "svelte/transition";
import { quintOut } from "svelte/easing";
import { Badge } from "$lib/components/ui/badge";
import * as Collapsible from "$lib/components/ui/collapsible";
import { viewPreferencesStore } from "$lib/stores/viewPreferences.svelte";
import FoodItemCard from "$lib/components/FoodItemCard.svelte";

let {
	category,
	items,
	onItemClick,
}: {
	category: string;
	items: FoodItem[];
	onItemClick: (item: FoodItem) => void;
} = $props();

const categoryLabel = $derived(
	category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
);
</script>

{#if viewPreferencesStore.viewMode === "condensed"}
	<Collapsible.Root
		open={!viewPreferencesStore.openCategories.has(category)}
		onOpenChange={() => viewPreferencesStore.toggleCategory(category)}
	>
		<Collapsible.Trigger
			class="flex items-center gap-3 w-full hover:opacity-75 transition-opacity"
		>
			<h2 class="text-2xl font-bold">{categoryLabel}</h2>
			<Badge variant="secondary">{items.length}</Badge>
			<ChevronDown
				class="h-5 w-5 transition-transform duration-300 ease-in-out {viewPreferencesStore.openCategories.has(
					category,
				)
					? ''
					: 'rotate-180'}"
			/>
		</Collapsible.Trigger>

		<Collapsible.Content forceMount>
			{#snippet child({ open })}
				{#if open}
					<div
						transition:slide={{ duration: 300, easing: quintOut }}
					>
						<div class="flex flex-col gap-2 mt-4">
							{#each items as item}
								<FoodItemCard
									{item}
									onclick={() => onItemClick(item)}
								/>
							{/each}
						</div>
					</div>
				{/if}
			{/snippet}
		</Collapsible.Content>
	</Collapsible.Root>
{:else}
	<section class="space-y-4">
		<div class="flex items-center gap-3">
			<h2 class="text-2xl font-bold">{categoryLabel}</h2>
			<Badge variant="secondary">{items.length}</Badge>
		</div>

		<div class="grid grid-cols-1 gap-4">
			{#each items as item}
				<FoodItemCard {item} onclick={() => onItemClick(item)} />
			{/each}
		</div>
	</section>
{/if}
