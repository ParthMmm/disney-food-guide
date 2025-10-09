<script lang="ts" module>
    import type { FoodItem } from "$lib/types/types";
</script>

<script lang="ts">
    import { Heart } from "lucide-svelte";
    import FoodImage from "$lib/components/FoodImage.svelte";
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import * as Drawer from "$lib/components/ui/drawer";
    import { Separator } from "$lib/components/ui/separator";
    import { favoritesStore } from "$lib/stores/favorites.svelte";

    let {
        open = $bindable(false),
        item,
    }: {
        open: boolean;
        item: FoodItem | null;
    } = $props();
</script>

<Drawer.Root bind:open>
    <Drawer.Content class="w-full sm:max-w-2xl p-4 h-[95vh] flex flex-col">
        {#if item}
            <div class="flex-1 overflow-y-auto" style="touch-action: pan-y;">
                <FoodImage
                    src={item.imageUrl}
                    alt={item.name}
                    name={item.name}
                    description={item.description}
                    category={item.category}
                    itemType={item.itemType}
                    class="w-full h-64 object-cover rounded-xl"
                />

                <div class="p-6 space-y-4">
                    <Drawer.Header class="p-0">
                        <Drawer.Title class="text-3xl">{item.name}</Drawer.Title
                        >
                        {#if item.description}
                            <Drawer.Description class="text-base mt-2">
                                {item.description}
                            </Drawer.Description>
                        {/if}
                    </Drawer.Header>

                    <div class="flex items-center gap-4 flex-wrap">
                        {#if item.price}
                            <span class="text-3xl font-bold text-primary">
                                ${item.price.toFixed(2)}
                            </span>
                        {/if}
                        {#if item.mobileOrderAvailable}
                            <Badge variant="outline" class="text-base px-3 py-1"
                                >📱</Badge
                            >
                        {/if}
                        <button
                            onclick={(e) => {
                                e.stopPropagation();
                                if (item) favoritesStore.toggle(item.id);
                            }}
                            class="ml-auto p-2 rounded-full hover:bg-accent transition-colors"
                            aria-label="Toggle favorite"
                        >
                            <Heart
                                class="h-6 w-6 transition-colors {item &&
                                favoritesStore.isFavorite(item.id)
                                    ? 'fill-red-500 stroke-red-500'
                                    : 'stroke-foreground'}"
                            />
                        </button>
                    </div>

                    <Separator />

                    <div class="space-y-3">
                        {#if item.restaurant}
                            <div>
                                <h3
                                    class="text-sm font-semibold text-muted-foreground mb-1"
                                >
                                    Location
                                </h3>
                                <p class="text-base">📍 {item.restaurant}</p>
                                {#if item.location}
                                    <p class="text-sm text-muted-foreground">
                                        {item.location}
                                    </p>
                                {/if}
                            </div>
                        {/if}

                        {#if item.availability.startDate && item.availability.endDate}
                            {@const start = new Date(
                                item.availability.startDate,
                            )}
                            {@const end = new Date(item.availability.endDate)}
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

                        {#if item.tags.length > 0}
                            <div>
                                <h3
                                    class="text-sm font-semibold text-muted-foreground mb-2"
                                >
                                    Tags
                                </h3>
                                <div class="flex flex-wrap gap-2">
                                    {#each item.tags as tag}
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

            <div class="pt-4 border-t">
                <Button onclick={() => (open = false)} class="w-full">
                    Close
                </Button>
            </div>
        {/if}
    </Drawer.Content>
</Drawer.Root>
