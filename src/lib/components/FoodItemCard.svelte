<script lang="ts" module>
import type { FoodItem } from "$lib/types/types";
</script>

<script lang="ts">
    import { Heart } from "lucide-svelte";
    import FoodImage from "$lib/components/FoodImage.svelte";
    import * as Card from "$lib/components/ui/card";
    import { favoritesStore } from "$lib/stores/favorites.svelte";
    import { viewPreferencesStore } from "$lib/stores/viewPreferences.svelte";
    import { cn } from "$lib/utils";

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
            ? "overflow-hidden hover:shadow-md transition-shadow relative cursor-pointer flex flex-row items-start gap-3 border-0 rounded-0 p-3 -mx-2"
            : "pt-0 gap-3 rounded-md overflow-hidden hover:shadow-lg transition-shadow relative cursor-pointer shadow-xs",
    );

    const heartButtonClass = $derived(
        isCondensed
            ? "absolute top-[37%] right-2 z-10 p-1.5 rounded-full bg-none dark:bg-background/25 backdrop-blur-sm hover:bg-background transition-colors"
            : "absolute top-3 right-3 z-10 p-2 rounded-full bg-background/25 backdrop-blur-sm hover:bg-background transition-colors",
    );

    const favoriteIconClass = $derived.by(() => {
        if (favoritesStore.isFavorite(item.id)) {
            return "fill-orange-500 stroke-orange-500";
        }

        if (isCondensed) {
            return "stroke-black dark:stroke-foreground";
        }

        return "stroke-white dark:stroke-foreground";
    });

    const heartIconClass = $derived(
        cn(isCondensed ? "h-4 w-4" : "h-5 w-5", "transition-colors", favoriteIconClass),
    );

    const imageClass = $derived(
        isCondensed
            ? "h-20 w-20 shrink-0 object-cover -my-1 ml-[-4px] rounded-md"
            : "h-[200px] w-full object-cover rounded-t-md rounded-b-none",
    );

    const availabilityBadges = $derived(
        [
            { date: "2026-05-04", label: "✨", title: "Available on May the 4th" },
            { date: "2026-05-31", label: "🗓️", title: "Available through May" },
        ].filter(({ date }) => isAvailableOn(date)),
    );

    function isAvailableOn(date: string) {
        const { startDate, endDate } = item.availability;
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        const selectedDate = new Date(date);

        return (!start || selectedDate >= start) && (!end || selectedDate <= end);
    }

    function handleCardKeydown(event: KeyboardEvent) {
        if (!onclick || event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onclick();
        }
    }
</script>

<Card.Root
    class={cardClass}
    {onclick}
    role={onclick ? "button" : undefined}
    tabindex={onclick ? 0 : undefined}
    aria-label={onclick ? `View details for ${item.name}` : undefined}
    onkeydown={handleCardKeydown}
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

    {#if isCondensed}
        <div class="flex flex-col items-start w-full min-w-0 space-y-1">
            <div class="w-full">
                <div
                    class="flex items-center justify-between gap-2 w-full pr-2"
                >
                    <h3 class="font-semibold text-md line-clamp-1 flex-1">
                        {item.name}
                    </h3>
                </div>

                <div class="flex items-center flex-wrap">
                    {#if item.restaurant}
                        <span class="text-sm text-muted-foreground/85"
                            >{item.restaurant}</span
                        >
                    {/if}
                </div>
            </div>
            <div class="flex items-start gap-1">
                {#if item.mobileOrderAvailable}
                    <span class="text-xs">📱</span>
                {/if}

                <div class="flex item-start gap-1">
                    {#each availabilityBadges as badge (badge.date)}
                        <span class="text-xs" title={badge.title}>{badge.label}</span>
                    {/each}
                </div>
            </div>
        </div>
    {:else}
        <Card.Header class="px-3">
            <div class="flex justify-between items-center">
                <Card.Title class="line-clamp-2 text-xl">{item.name}</Card.Title
                >
                {#if item.price}
                    <span class="text-md tabular-nums font-bold text-primary">
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

        <Card.Content class="space-y-1 px-3">
            {#if item.restaurant}
                <p class="text-sm text-muted-foreground">
                    {item.restaurant}
                </p>
            {/if}

            <div class="flex items-start gap-1">
                {#if item.mobileOrderAvailable}
                    <span class="text-sm">📱</span>
                {/if}

                <div class="flex item-start gap-1">
                    {#each availabilityBadges as badge (badge.date)}
                        <span class="text-sm" title={badge.title}>{badge.label}</span>
                    {/each}
                </div>
            </div>
        </Card.Content>
    {/if}
</Card.Root>
