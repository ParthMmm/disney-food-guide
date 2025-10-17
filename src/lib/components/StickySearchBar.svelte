<script lang="ts">
import { Search, X } from "lucide-svelte";
import { Input } from "$lib/components/ui/input";
import { Button } from "$lib/components/ui/button";
import { filtersStore } from "$lib/stores/filters.svelte";
import { onMount } from "svelte";

let {
	topSearchElement,
}: {
	topSearchElement: HTMLElement | undefined;
} = $props();

let isVisible = $state(false);

onMount(() => {
	if (!topSearchElement) return;

	const observer = new IntersectionObserver(
		(entries) => {
			// Show sticky bar when top search is not visible
			isVisible = !entries[0].isIntersecting;
		},
		{
			threshold: 0,
			rootMargin: "-1px",
		},
	);

	observer.observe(topSearchElement);

	return () => {
		observer.disconnect();
	};
});
</script>

<div
	class="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out {isVisible
		? 'translate-y-0'
		: 'translate-y-full'}"
>
	<div
		class="backdrop-blur-lg bg-background/95 border-t border-border shadow-lg"
	>
		<div class="container mx-auto px-4 py-3 max-w-7xl">
			<div class="relative">
				<Search
					class="absolute left-3 top-1/2 text-muted-foreground -translate-y-1/2 h-4 w-4 pointer-events-none"
				/>
				<Input
					type="text"
					placeholder="Search..."
					value={filtersStore.searchQuery}
					oninput={(e) => filtersStore.setSearchQuery(e.currentTarget.value)}
					class="pl-9 pr-9"
				/>
				{#if filtersStore.searchQuery}
					<Button
						variant="ghost"
						size="sm"
						onclick={() => filtersStore.setSearchQuery("")}
						class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
					>
						<X class="h-4 w-4" />
					</Button>
				{/if}
			</div>
		</div>
	</div>
</div>
