<script lang="ts">
import { Heart, LayoutGrid, List, Search } from "lucide-svelte";
import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
import { filtersStore } from "$lib/stores/filters.svelte";
import { viewPreferencesStore } from "$lib/stores/viewPreferences.svelte";

let {
	filterSlot,
}: {
	filterSlot?: import("svelte").Snippet;
} = $props();
</script>

<div class="mb-6 flex flex-col gap-3">
	<div class="relative flex-1">
		<Search
			class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
		/>
		<Input
			type="text"
			placeholder="Search..."
			value={filtersStore.searchQuery}
			oninput={(e) => filtersStore.setSearchQuery(e.currentTarget.value)}
			class="pl-9"
		/>
	</div>
	<div>
		<Button
			variant="outline"
			onclick={() =>
				viewPreferencesStore.setViewMode(
					viewPreferencesStore.viewMode === "grid"
						? "condensed"
						: "grid",
				)}
		>
			{#if viewPreferencesStore.viewMode === "grid"}
				<List class="h-4 w-4" />
			{:else}
				<LayoutGrid class="h-4 w-4" />
			{/if}
		</Button>
		<Button
			variant={filtersStore.favoritesOnly ? "default" : "outline"}
			onclick={() => filtersStore.setFavoritesOnly(!filtersStore.favoritesOnly)}
		>
			<Heart
				class="h-4 w-4  {filtersStore.favoritesOnly ? 'fill-current' : ''}"
			/>
		</Button>

		{#if filterSlot}
			{@render filterSlot()}
		{/if}
	</div>
</div>
