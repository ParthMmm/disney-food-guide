<script lang="ts" module>
import type { FoodItem } from "$lib/types/types";
</script>

<script lang="ts">
    import { ChevronDown } from "lucide-svelte";
    import { fade, slide } from "svelte/transition";
    import { Tween } from "svelte/motion";
    import { cubicInOut, cubicOut, sineOut } from "svelte/easing";
    import { Badge } from "$lib/components/ui/badge";
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

    const isOpen = $derived(!viewPreferencesStore.openCategories.has(category));

    const rotation = new Tween(180, {
        duration: 300,
        easing: cubicOut,
    });

    const height = new Tween(0, {
        duration: 250,
        easing: sineOut,
    });

    let contentHeight = $state(0);

    function measureHeight(node: HTMLElement) {
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                contentHeight = entry.contentRect.height;
            }
        });
        observer.observe(node);
        return {
            destroy() {
                observer.disconnect();
            },
        };
    }

    $effect(() => {
        rotation.target = isOpen ? 180 : 0;
        height.target = isOpen ? contentHeight : 0;
    });
</script>

{#if viewPreferencesStore.viewMode === "condensed"}
    <section>
        <button
            onclick={() => viewPreferencesStore.toggleCategory(category)}
            class="flex items-center gap-1 w-full hover:opacity-75 transition-opacity"
        >
            <h2 class="text-lg font-bold">{categoryLabel}</h2>
            <Badge variant="outline" class="border-0">{items.length}</Badge>
            <ChevronDown
                class="h-5 w-5"
                style="transform: rotate({rotation.current}deg);"
            />
        </button>

        <div class="overflow-hidden" style="height: {height.current}px;">
            <div use:measureHeight>
                {#if isOpen}
                    <div
                        transition:slide={{ duration: 250, easing: cubicInOut }}
                        class="flex flex-col mt-4 [&>*]:border-t [&>*]:border-border [&>*:last-child]:border-b"
                    >
                        {#each items as item, i}
                            <div
                                transition:fade={{
                                    duration: 50,
                                    delay: 50 + i * 20,
                                }}
                            >
                                <FoodItemCard
                                    {item}
                                    onclick={() => onItemClick(item)}
                                />
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </section>
{:else}
    <section class="space-y-4">
        <div class="flex items-center gap-1">
            <h2 class="text-lg font-bold">{categoryLabel}</h2>
            <Badge variant="outline" class="border-0">{items.length}</Badge>
        </div>

        <div class="grid grid-cols-1 gap-4">
            {#each items as item}
                <FoodItemCard {item} onclick={() => onItemClick(item)} />
            {/each}
        </div>
    </section>
{/if}
