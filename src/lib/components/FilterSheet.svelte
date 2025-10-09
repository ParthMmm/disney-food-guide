<script lang="ts" module>
    export type FilterItem = {
        id: string;
        label: string;
        onRemove: () => void;
    };
</script>

<script lang="ts">
    import { X } from "lucide-svelte";
    import { Tween, tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import * as Drawer from "$lib/components/ui/drawer";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import { Separator } from "$lib/components/ui/separator";
    import { Slider } from "$lib/components/ui/slider";
    import { filtersStore } from "$lib/stores/filters.svelte";

    let {
        open = $bindable(false),
        categories,
        allTags,
        activeFilters,
        children,
    }: {
        open: boolean;
        categories: string[];
        allTags: string[];
        activeFilters: FilterItem[];
        children: import("svelte").Snippet;
    } = $props();

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

    let filterHeight = $state(0);
    let animatedHeight = new Tween(0, {
        duration: 200,
        easing: cubicOut,
    });

    function measureHeight(node: HTMLElement) {
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                filterHeight = entry.contentRect.height;
            }
        });
        observer.observe(node);

        animatedHeight.set(activeFilters.length > 0 ? filterHeight : 0);

        return {
            destroy() {
                observer.disconnect();
            },
        };
    }

    $effect(() => {
        animatedHeight.set(activeFilters.length > 0 ? filterHeight : 0);
    });
</script>

<Drawer.Root bind:open shouldScaleBackground>
    <Drawer.Trigger>
        {@render children()}
    </Drawer.Trigger>
    <Drawer.Content class="w-full sm:max-w-2xl p-4 max-h-[95vh] flex flex-col">
        <Drawer.Header>
            <Drawer.Title class="text-center">Filters</Drawer.Title>
            <div
                class="overflow-hidden"
                style:height={`${animatedHeight.current + 25}px`}
            >
                <div use:measureHeight>
                    {#if activeFilters.length > 0}
                        <Drawer.Description class="flex flex-wrap gap-2 mt-2">
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
                </div>
            </div>
        </Drawer.Header>

        <div
            class="flex-1 overflow-y-auto -mx-4 px-4"
            style="touch-action: pan-y;"
        >
            <div class="space-y-3 pb-4">
                <div class="space-y-3">
                    <h3 class="font-semibold">Category</h3>
                    <select
                        value={filtersStore.selectedCategory}
                        onchange={(e) =>
                            filtersStore.setSelectedCategory(
                                e.currentTarget.value,
                            )}
                        class="flex h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="all">All Categories</option>
                        {#each categories as category}
                            <option value={category}>
                                {category
                                    .replace(/-/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </option>
                        {/each}
                    </select>
                </div>

                <div class="space-y-3">
                    <h3 class="font-semibold">Park Location</h3>
                    <div class="flex">
                        <button
                            onclick={() =>
                                filtersStore.toggleLocation("Disneyland")}
                            class="flex-1 flex items-center justify-center h-12 px-4 transition-all border
							   first:rounded-l-lg
							   {filtersStore.selectedLocations.has('Disneyland')
                                ? 'bg-primary/25 text-primary-foreground border-primary z-10'
                                : 'bg-background hover:bg-accent border'}"
                        >
                            <span class="text-2xl">🏰</span>
                        </button>
                        <button
                            onclick={() =>
                                filtersStore.toggleLocation(
                                    "California Adventure",
                                )}
                            class="flex-1 flex items-center justify-center h-12 px-4 transition-all border
							   -ml-px last:rounded-r-lg
							   {filtersStore.selectedLocations.has('California Adventure')
                                ? 'bg-primary/25 text-primary-foreground border-primary z-10'
                                : 'bg-background hover:bg-accent border'}"
                        >
                            <span class="text-2xl">🎡</span>
                        </button>
                    </div>
                </div>

                <div class="space-y-3">
                    <h3 class="font-semibold">Available On Date</h3>
                    <div class="flex">
                        {#each dates as date (date.id)}
                            <button
                                onclick={() => filtersStore.toggleDate(date.id)}
                                class="flex-1 flex items-center justify-center h-12 px-4 transition-all border
								   -ml-px first:ml-0 first:rounded-l-lg last:rounded-r-lg
								   {filtersStore.selectedDates.has(date.id)
                                    ? 'bg-primary/25 text-primary-foreground border-primary z-10'
                                    : 'bg-background hover:bg-accent border'}"
                            >
                                <span class="text-2xl">{date.label}</span>
                            </button>
                        {/each}
                    </div>
                </div>

                <div class="space-y-3">
                    <h3 class="font-semibold">
                        Price Range: ${filtersStore.priceRange[0]} - ${filtersStore
                            .priceRange[1]}
                    </h3>
                    <Slider
                        type="multiple"
                        bind:value={filtersStore.priceRange}
                        min={1}
                        max={30}
                        step={1}
                        class=""
                    />
                </div>

                <!-- <Separator />

                <div class="space-y-3">
                    <h3 class="font-semibold">Tags</h3>
                    <ScrollArea class="h-64">
                        <div class="flex flex-wrap gap-2 pr-4">
                            {#each allTags as tag}
                                <button
                                    onclick={() => filtersStore.toggleTag(tag)}
                                    class="inline-flex items-center rounded-full border px-3 py-1 text-xs transition-colors {filtersStore.selectedTags.has(
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
                </div> -->
            </div>
        </div>

        <div class="flex gap-2 pt-4 border-t pb-4">
            <Button
                onclick={filtersStore.clearFilters}
                variant="outline"
                class="flex-1"
            >
                <X class="h-4 w-4 mr-2" />
                Clear All
            </Button>
            <Button onclick={() => (open = false)} class="flex-1">Apply</Button>
        </div>
    </Drawer.Content>
</Drawer.Root>
