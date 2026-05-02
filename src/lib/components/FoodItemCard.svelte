<script lang="ts" module>
import type { FoodItem } from "$lib/types/types";
</script>

<script lang="ts">
    import { Heart } from "lucide-svelte";
    import FoodImage from "$lib/components/FoodImage.svelte";
    import { favoritesStore } from "$lib/stores/favorites.svelte";
    import { viewPreferencesStore } from "$lib/stores/viewPreferences.svelte";
    import { getActiveAvailabilityBadges } from "$lib/utils/availability";

    let {
        item,
        onclick,
    }: {
        item: FoodItem;
        onclick?: () => void;
    } = $props();

    const isCondensed = $derived(viewPreferencesStore.viewMode === "condensed");
    const isFav = $derived(favoritesStore.isFavorite(item.id));
    const availabilityBadges = $derived(getActiveAvailabilityBadges(item));

    function handleCardKeydown(event: KeyboardEvent) {
        if (!onclick || event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onclick();
        }
    }
</script>

{#if isCondensed}
    <div
        class="manifest group"
        {onclick}
        role={onclick ? "button" : undefined}
        tabindex={onclick ? 0 : undefined}
        aria-label={onclick ? `View details for ${item.name}` : undefined}
        onkeydown={handleCardKeydown}
    >
        <span class="manifest-rail" aria-hidden="true"></span>

        <div class="manifest-img-wrap">
            <FoodImage
                src={item.imageUrl}
                alt={item.name}
                name={item.name}
                description={item.description}
                category={item.category}
                itemType={item.itemType}
                class="manifest-img"
            />
        </div>

        <div class="manifest-body">
            <div class="manifest-top">
                <h3 class="manifest-name">{item.name}</h3>
                {#if item.price}
                    <span class="manifest-price tabular-nums">
                        ₢{item.price.toFixed(2)}
                    </span>
                {/if}
            </div>

            <div class="manifest-meta">
                {#if item.restaurant}
                    <span class="manifest-rest">{item.restaurant}</span>
                {/if}
            </div>

            <div class="manifest-flags">
                {#if item.mobileOrderAvailable}
                    <span class="flag" title="Mobile order">📱</span>
                {/if}
                {#each availabilityBadges as badge (badge.date)}
                    <span class="flag" title={badge.title}>{badge.label}</span>
                {/each}
            </div>
        </div>

        <button
            onclick={(e) => {
                e.stopPropagation();
                favoritesStore.toggle(item.id);
            }}
            class="manifest-fav"
            class:is-fav={isFav}
            aria-label="Toggle favorite"
        >
            <Heart class="h-4 w-4" />
        </button>
    </div>
{:else}
    <article
        class="hud group"
        {onclick}
        role={onclick ? "button" : undefined}
        tabindex={onclick ? 0 : undefined}
        aria-label={onclick ? `View details for ${item.name}` : undefined}
        onkeydown={handleCardKeydown}
    >
        <div class="hud-imgwrap">
            <FoodImage
                src={item.imageUrl}
                alt={item.name}
                name={item.name}
                description={item.description}
                category={item.category}
                itemType={item.itemType}
                class="hud-img"
            />
            <span class="hud-scrim" aria-hidden="true"></span>
            <span class="bracket bracket-tl" aria-hidden="true"></span>
            <span class="bracket bracket-tr" aria-hidden="true"></span>
            <span class="bracket bracket-bl" aria-hidden="true"></span>
            <span class="bracket bracket-br" aria-hidden="true"></span>
            {#if item.price}
                <span class="hud-price tabular-nums">
                    <span class="hud-price-mark">₢</span>{item.price.toFixed(2)}
                </span>
            {/if}
            <button
                onclick={(e) => {
                    e.stopPropagation();
                    favoritesStore.toggle(item.id);
                }}
                class="hud-fav"
                class:is-fav={isFav}
                aria-label="Toggle favorite"
            >
                <Heart class="h-[18px] w-[18px]" />
            </button>
        </div>
        <div class="hud-body">
            <h3 class="hud-name">{item.name}</h3>

            {#if item.description}
                <p class="hud-desc">{item.description}</p>
            {/if}

            <div class="hud-foot">
                {#if item.restaurant}
                    <span class="hud-rest">
                        <span class="hud-dot" aria-hidden="true"></span>
                        {item.restaurant}
                    </span>
                {/if}

                <div class="hud-flags">
                    {#if item.mobileOrderAvailable}
                        <span class="flag" title="Mobile order">📱</span>
                    {/if}
                    {#each availabilityBadges as badge (badge.date)}
                        <span class="flag" title={badge.title}>{badge.label}</span>
                    {/each}
                </div>
            </div>
        </div>
    </article>
{/if}

<style>
    .hud {
        position: relative;
        display: flex;
        flex-direction: column;
        background: var(--card);
        color: var(--card-foreground);
        border: 1px solid var(--border);
        transition-property: transform, box-shadow, border-color;
        transition-duration: 220ms;
        transition-timing-function: cubic-bezier(0.2, 0.7, 0.2, 1);
        /* Star Wars-y notched corner via clip-path */
        clip-path: polygon(
            14px 0,
            100% 0,
            100% calc(100% - 14px),
            calc(100% - 14px) 100%,
            0 100%,
            0 14px
        );
        cursor: pointer;
        overflow: hidden;
        box-shadow: var(--shadow-xs);
    }
    .hud:active {
        transform: scale(0.985);
        transition-duration: 80ms;
    }
    .hud:focus-visible {
        box-shadow: var(--shadow-lg);
        border-color: color-mix(in oklch, var(--primary) 55%, var(--border));
        outline: none;
    }
    @media (hover: hover) {
        .hud:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
            border-color: color-mix(in oklch, var(--primary) 55%, var(--border));
        }
    }

    .hud-imgwrap {
        position: relative;
        aspect-ratio: 4 / 3;
        overflow: hidden;
        background: color-mix(in oklch, var(--muted) 80%, transparent);
    }
    .hud :global(.hud-img) {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 600ms cubic-bezier(0.2, 0.7, 0.2, 1);
        outline: 1px solid rgba(0, 0, 0, 0.1);
        outline-offset: -1px;
    }
    :global(.dark) .hud :global(.hud-img) {
        outline-color: rgba(255, 255, 255, 0.1);
    }
    @media (hover: hover) {
        .hud:hover :global(.hud-img) {
            transform: scale(1.04);
        }
    }

    .hud-scrim {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
            linear-gradient(
                to top,
                color-mix(in oklch, var(--card) 95%, transparent) 0%,
                color-mix(in oklch, var(--card) 35%, transparent) 22%,
                transparent 55%
            ),
            radial-gradient(
                120% 60% at 50% 0%,
                color-mix(in oklch, black 18%, transparent),
                transparent 60%
            );
    }

    /* HUD corner brackets */
    .bracket {
        position: absolute;
        width: 18px;
        height: 18px;
        pointer-events: none;
        opacity: 0.85;
        --br-color: color-mix(in oklch, var(--primary) 70%, white 0%);
    }
    .bracket-tl {
        top: 10px;
        left: 10px;
        border-top: 1.5px solid var(--br-color);
        border-left: 1.5px solid var(--br-color);
    }
    .bracket-tr {
        top: 10px;
        right: 10px;
        border-top: 1.5px solid var(--br-color);
        border-right: 1.5px solid var(--br-color);
    }
    .bracket-bl {
        bottom: 10px;
        left: 10px;
        border-bottom: 1.5px solid var(--br-color);
        border-left: 1.5px solid var(--br-color);
    }
    .bracket-br {
        bottom: 10px;
        right: 10px;
        border-bottom: 1.5px solid var(--br-color);
        border-right: 1.5px solid var(--br-color);
    }

    .hud-price {
        position: absolute;
        top: 12px;
        left: 12px;
        display: inline-flex;
        align-items: baseline;
        gap: 2px;
        padding: 5px 10px 5px 8px;
        background: var(--accent);
        color: var(--accent-foreground);
        font-family: var(--font-mono);
        font-weight: 700;
        font-size: 13px;
        letter-spacing: 0.02em;
        clip-path: polygon(
            8px 0,
            100% 0,
            100% 100%,
            0 100%,
            0 8px
        );
        box-shadow: 0 2px 8px oklch(0 0 0 / 0.25);
    }
    .hud-price-mark {
        font-size: 10px;
        opacity: 0.75;
        margin-right: 1px;
    }

    .hud-fav {
        position: absolute;
        top: 6px;
        right: 6px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 999px;
        background: color-mix(in oklch, black 35%, transparent);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        color: white;
        border: 1px solid color-mix(in oklch, white 18%, transparent);
        transition-property: transform, background, color;
        transition-duration: 180ms;
        transition-timing-function: ease;
        cursor: pointer;
    }
    .hud-fav:active {
        transform: scale(0.92);
        transition-duration: 80ms;
    }
    @media (hover: hover) {
        .hud-fav:hover {
            background: color-mix(in oklch, black 55%, transparent);
            transform: scale(1.06);
        }
    }
    .hud-fav.is-fav {
        color: oklch(0.7 0.2 30);
        background: color-mix(in oklch, black 50%, transparent);
    }
    .hud-fav.is-fav :global(svg) {
        fill: oklch(0.7 0.2 30);
    }

    .hud-body {
        padding: 14px 16px 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .hud-name {
        font-family: var(--font-display);
        font-weight: 400;
        font-size: 1.25rem;
        line-height: 1.15;
        letter-spacing: 0.01em;
        text-transform: uppercase;
        color: var(--foreground);
        text-wrap: balance;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .hud-desc {
        font-size: 0.85rem;
        line-height: 1.45;
        color: var(--muted-foreground);
        text-wrap: pretty;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .hud-foot {
        margin-top: 4px;
        padding-top: 10px;
        border-top: 1px dashed color-mix(in oklch, var(--border) 90%, transparent);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }
    .hud-rest {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: var(--font-mono);
        font-size: 11px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--muted-foreground);
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .hud-dot {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: var(--primary);
        box-shadow: 0 0 0 3px color-mix(in oklch, var(--primary) 25%, transparent);
        flex-shrink: 0;
    }
    .hud-flags {
        display: inline-flex;
        gap: 4px;
        flex-shrink: 0;
    }
    .flag {
        font-size: 13px;
        line-height: 1;
    }
    .manifest {
        position: relative;
        display: grid;
        grid-template-columns: 4px 72px 1fr auto;
        gap: 12px;
        align-items: center;
        padding: 10px 10px 10px 0;
        margin: 0 -8px;
        border-bottom: 1px solid color-mix(in oklch, var(--border) 70%, transparent);
        cursor: pointer;
        transition: background 160ms ease;
    }
    .manifest:focus-visible {
        background: color-mix(in oklch, var(--primary) 6%, transparent);
        outline: none;
    }
    @media (hover: hover) {
        .manifest:hover {
            background: color-mix(in oklch, var(--primary) 6%, transparent);
        }
        .manifest:hover .manifest-rail {
            opacity: 1;
        }
    }
    .manifest-rail {
        align-self: stretch;
        width: 3px;
        background: linear-gradient(
            to bottom,
            transparent,
            var(--primary) 20%,
            var(--primary) 80%,
            transparent
        );
        opacity: 0.4;
        transition: opacity 160ms ease;
    }
    .manifest-img-wrap {
        position: relative;
        width: 72px;
        height: 72px;
        overflow: hidden;
        clip-path: polygon(
            8px 0,
            100% 0,
            100% calc(100% - 8px),
            calc(100% - 8px) 100%,
            0 100%,
            0 8px
        );
    }
    .manifest :global(.manifest-img) {
        width: 100%;
        height: 100%;
        object-fit: cover;
        outline: 1px solid rgba(0, 0, 0, 0.1);
        outline-offset: -1px;
    }
    :global(.dark) .manifest :global(.manifest-img) {
        outline-color: rgba(255, 255, 255, 0.1);
    }

    .manifest-body {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .manifest-top {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
    }
    .manifest-name {
        font-family: var(--font-display);
        font-weight: 400;
        font-size: 1rem;
        letter-spacing: 0.01em;
        text-transform: uppercase;
        line-height: 1.2;
        color: var(--foreground);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
        min-width: 0;
    }
    .manifest-price {
        font-family: var(--font-mono);
        font-size: 12px;
        font-weight: 700;
        color: var(--primary);
        letter-spacing: 0.02em;
        flex-shrink: 0;
    }
    .manifest-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted-foreground);
        min-width: 0;
    }
    .manifest-rest {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
    }
    .manifest-flags {
        display: flex;
        gap: 3px;
        margin-top: 2px;
        min-height: 14px;
    }

    .manifest-fav {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 999px;
        background: transparent;
        color: var(--muted-foreground);
        transition-property: background, color, transform;
        transition-duration: 160ms;
        transition-timing-function: ease;
        cursor: pointer;
        flex-shrink: 0;
    }
    .manifest-fav:active {
        transform: scale(0.92);
        transition-duration: 80ms;
    }
    @media (hover: hover) {
        .manifest-fav:hover {
            background: color-mix(in oklch, var(--primary) 12%, transparent);
            color: var(--foreground);
            transform: scale(1.08);
        }
    }
    .manifest-fav.is-fav {
        color: oklch(0.7 0.2 30);
    }
    .manifest-fav.is-fav :global(svg) {
        fill: oklch(0.7 0.2 30);
    }

    @media (prefers-reduced-motion: reduce) {
        .hud,
        .hud :global(.hud-img),
        .hud-fav,
        .manifest,
        .manifest-fav {
            transition: none;
        }
        .hud:hover,
        .hud:hover :global(.hud-img),
        .hud-fav:hover,
        .manifest-fav:hover {
            transform: none;
        }
    }
</style>
