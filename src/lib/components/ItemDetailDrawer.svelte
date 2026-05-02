<script lang="ts" module>
import type { FoodItem } from "$lib/types/types";
</script>

<script lang="ts">
    import { Heart } from "lucide-svelte";
    import FoodImage from "$lib/components/FoodImage.svelte";
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

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    function isAvailableOn(item: FoodItem, date: string) {
        const { startDate, endDate } = item.availability;
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        const selectedDate = new Date(date);

        return (!start || selectedDate >= start) && (!end || selectedDate <= end);
    }

    function availabilityLabel(item: FoodItem) {
        const { startDate, endDate } = item.availability;
        const start = startDate ? formatDate(startDate) : "Now";
        const end = endDate ? formatDate(endDate) : "while supplies last";

        return `${start} - ${end}`;
    }
</script>

<Drawer.Root bind:open shouldScaleBackground>
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
                    class="w-full h-64 mt-2 object-cover rounded-md"
                />

                <div class="py-6 px-2 space-y-4">
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
                            <div>📱</div>
                        {/if}
                        <button
                            onclick={() => favoritesStore.toggle(item.id)}
                            class="ml-auto p-2 rounded-full hover:bg-accent transition-colors"
                            aria-label="Toggle favorite"
                        >
                            <Heart
                                class="h-6 w-6 transition-colors {favoritesStore.isFavorite(
                                    item.id,
                                )
                                    ? 'fill-orange-500 stroke-orange-500'
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
                                <p class="text-base">{item.restaurant}</p>
                                {#if item.location}
                                    <p class="text-sm text-muted-foreground">
                                        {item.location}
                                    </p>
                                {/if}
                            </div>
                        {/if}

                        {#if item.availability.startDate || item.availability.endDate}
                            <div>
                                <h3
                                    class="text-sm font-semibold text-muted-foreground mb-1"
                                >
                                    Availability
                                </h3>
                                <p class="text-base">{availabilityLabel(item)}</p>
                                <div class="flex flex-wrap gap-2 mt-2">
                                    {#if isAvailableOn(item, "2026-05-04")}
                                        <div title="Available on May the 4th">✨</div>
                                    {/if}
                                    {#if isAvailableOn(item, "2026-05-31")}
                                        <div title="Available through May">🗓️</div>
                                    {/if}
                                </div>
                            </div>
                        {/if}

                    </div>
                </div>
            </div>

            <div class="pt-4 border-t pb-6">
                <Button onclick={() => (open = false)} class="w-full">
                    Close
                </Button>
            </div>
        {/if}
    </Drawer.Content>
</Drawer.Root>
