<script lang="ts" module>
import type { FoodItem } from "$lib/types/types";
</script>

<script lang="ts">
    import { Heart, X, MapPin, Smartphone, Calendar } from "lucide-svelte";
    import FoodImage from "$lib/components/FoodImage.svelte";
    import * as Drawer from "$lib/components/ui/drawer";
    import { favoritesStore } from "$lib/stores/favorites.svelte";
    import {
        AVAILABILITY_BADGES,
        availabilityLabel,
        isAvailableOn,
    } from "$lib/utils/availability";

    let {
        open = $bindable(false),
        item,
    }: {
        open: boolean;
        item: FoodItem | null;
    } = $props();

    const isFav = $derived(item ? favoritesStore.isFavorite(item.id) : false);

    // Verbose labels just for the drawer's badge cell — the emoji-only versions live in AVAILABILITY_BADGES.
    const BADGE_TEXT: Record<string, string> = {
        "2026-05-04": "May the 4th",
        "2026-05-31": "Through May",
    };
</script>

<Drawer.Root bind:open shouldScaleBackground>
    <Drawer.Content class="w-full sm:max-w-2xl p-0 h-[95dvh] max-h-[95dvh] flex flex-col bg-card border-0">
        {#if item}
            <header class="status-bar">
                <button
                    onclick={() => (open = false)}
                    class="status-close"
                    aria-label="Close"
                >
                    <X class="h-4 w-4" />
                </button>
            </header>

            <div
                class="flex-1 overflow-y-auto"
                style="touch-action: pan-y; overscroll-behavior: contain; -webkit-overflow-scrolling: touch;"
            >
                <div class="hero">
                    <FoodImage
                        src={item.imageUrl}
                        alt={item.name}
                        name={item.name}
                        description={item.description}
                        category={item.category}
                        itemType={item.itemType}
                        class="hero-img"
                    />
                    <span class="hero-scrim" aria-hidden="true"></span>
                    <span class="bracket bracket-tl" aria-hidden="true"></span>
                    <span class="bracket bracket-tr" aria-hidden="true"></span>
                    <span class="bracket bracket-bl" aria-hidden="true"></span>
                    <span class="bracket bracket-br" aria-hidden="true"></span>

                    {#if item.price}
                        <span class="hero-price tabular-nums">
                            <span class="hero-price-mark">₢</span>{item.price.toFixed(2)}
                        </span>
                    {/if}

                    <button
                        onclick={() => favoritesStore.toggle(item.id)}
                        class="hero-fav"
                        class:is-fav={isFav}
                        aria-label="Toggle favorite"
                    >
                        <Heart class="h-5 w-5" />
                    </button>
                    <Drawer.Title class="hero-title">{item.name}</Drawer.Title>
                </div>
                <div class="body">
                    {#if item.description}
                        <Drawer.Description class="lead">
                            {item.description}
                        </Drawer.Description>
                    {/if}
                    <dl class="grid">
                        {#if item.restaurant}
                            <div class="cell">
                                <dt class="label">
                                    <MapPin class="h-3 w-3" /> Location
                                </dt>
                                <dd class="value">{item.restaurant}</dd>
                                {#if item.location}
                                    <dd class="sub">{item.location}</dd>
                                {/if}
                            </div>
                        {/if}

                        {#if item.availability.startDate || item.availability.endDate}
                            <div class="cell">
                                <dt class="label">
                                    <Calendar class="h-3 w-3" /> Availability
                                </dt>
                                <dd class="value">{availabilityLabel(item)}</dd>
                                <dd class="badges">
                                    {#each AVAILABILITY_BADGES as badge (badge.date)}
                                        {#if isAvailableOn(item, badge.date)}
                                            <span class="badge" title={badge.title}>
                                                {badge.label} <span>{BADGE_TEXT[badge.date] ?? badge.title}</span>
                                            </span>
                                        {/if}
                                    {/each}
                                </dd>
                            </div>
                        {/if}

                        {#if item.mobileOrderAvailable}
                            <div class="cell">
                                <dt class="label">
                                    <Smartphone class="h-3 w-3" /> Mobile Order
                                </dt>
                                <dd class="value">Available via Disney app</dd>
                            </div>
                        {/if}

                        {#if item.category || item.itemType}
                            <div class="cell">
                                <dt class="label">▣ Manifest</dt>
                                <dd class="value cap">
                                    {item.itemType ?? item.category}
                                </dd>
                                {#if item.itemType && item.category}
                                    <dd class="sub cap">{item.category}</dd>
                                {/if}
                            </div>
                        {/if}
                    </dl>

                </div>
            </div>
            <footer class="action-bar">
                <button
                    onclick={() => favoritesStore.toggle(item.id)}
                    class="action-fav"
                    class:is-fav={isFav}
                >
                    <Heart class="h-4 w-4" />
                    <span>{isFav ? "Saved" : "Save"}</span>
                </button>
                <button
                    onclick={() => (open = false)}
                    class="action-primary"
                >
                    Close Channel
                </button>
            </footer>
        {/if}
    </Drawer.Content>
</Drawer.Root>

<style>
    .status-bar {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 10px 14px;
        background: color-mix(in oklch, var(--card) 92%, var(--primary) 8%);
        border-bottom: 1px solid var(--border);
    }
    .status-close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 999px;
        color: var(--foreground);
        background: transparent;
        transition: background 160ms ease;
        cursor: pointer;
        margin: -8px -8px -8px 0;
    }
    @media (hover: hover) {
        .status-close:hover {
            background: color-mix(in oklch, var(--primary) 14%, transparent);
        }
    }
    .status-close:active {
        transform: scale(0.92);
        transition-duration: 80ms;
    }
    .hero {
        position: relative;
        aspect-ratio: 16 / 10;
        overflow: hidden;
        background: var(--muted);
    }
    .hero :global(.hero-img) {
        width: 100%;
        height: 100%;
        object-fit: cover;
        outline: 1px solid rgba(0, 0, 0, 0.1);
        outline-offset: -1px;
    }
    :global(.dark) .hero :global(.hero-img) {
        outline-color: rgba(255, 255, 255, 0.1);
    }
    .hero-scrim {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(
            to top,
            color-mix(in oklch, var(--card) 96%, transparent) 0%,
            color-mix(in oklch, var(--card) 50%, transparent) 18%,
            transparent 55%
        );
    }
    .bracket {
        position: absolute;
        width: 22px;
        height: 22px;
        pointer-events: none;
        --br: color-mix(in oklch, var(--primary) 75%, white 0%);
    }
    .bracket-tl { top: 12px; left: 12px; border-top: 1.5px solid var(--br); border-left: 1.5px solid var(--br); }
    .bracket-tr { top: 12px; right: 12px; border-top: 1.5px solid var(--br); border-right: 1.5px solid var(--br); }
    .bracket-bl { bottom: 12px; left: 12px; border-bottom: 1.5px solid var(--br); border-left: 1.5px solid var(--br); }
    .bracket-br { bottom: 12px; right: 12px; border-bottom: 1.5px solid var(--br); border-right: 1.5px solid var(--br); }

    .hero-price {
        position: absolute;
        top: 14px;
        left: 14px;
        display: inline-flex;
        align-items: baseline;
        gap: 2px;
        padding: 6px 12px 6px 10px;
        background: var(--accent);
        color: var(--accent-foreground);
        font-family: var(--font-mono);
        font-weight: 700;
        font-size: 15px;
        letter-spacing: 0.02em;
        clip-path: polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px);
        box-shadow: 0 4px 14px oklch(0 0 0 / 0.3);
    }
    .hero-price-mark { font-size: 11px; opacity: 0.75; margin-right: 1px; }

    .hero-fav {
        position: absolute;
        top: 10px;
        right: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 999px;
        background: color-mix(in oklch, black 40%, transparent);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: white;
        border: 1px solid color-mix(in oklch, white 18%, transparent);
        transition-property: transform, background, color;
        transition-duration: 180ms;
        transition-timing-function: ease;
        cursor: pointer;
    }
    @media (hover: hover) {
        .hero-fav:hover { transform: scale(1.06); background: color-mix(in oklch, black 55%, transparent); }
    }
    .hero-fav:active {
        transform: scale(0.92);
        transition-duration: 80ms;
    }
    .hero-fav.is-fav { color: oklch(0.7 0.2 30); }
    .hero-fav.is-fav :global(svg) { fill: oklch(0.7 0.2 30); }

    .hero-title {
        position: absolute;
        left: 22px;
        right: 22px;
        bottom: 20px;
        font-family: var(--font-display);
        font-weight: 400;
        font-size: clamp(1.6rem, 5vw, 2.25rem);
        line-height: 1.05;
        letter-spacing: 0.01em;
        text-transform: uppercase;
        color: var(--foreground);
        text-shadow: 0 2px 18px oklch(0 0 0 / 0.35);
        text-wrap: balance;
    }
    .body {
        padding: 22px 22px 32px;
        display: flex;
        flex-direction: column;
        gap: 22px;
    }
    .lead {
        font-size: 0.95rem;
        line-height: 1.55;
        color: var(--foreground);
        opacity: 0.9;
        text-wrap: pretty;
    }

    .grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1px;
        background: var(--border);
        border: 1px solid var(--border);
    }
    @media (min-width: 520px) {
        .grid { grid-template-columns: 1fr 1fr; }
    }
    .cell {
        background: var(--card);
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--primary);
        margin-bottom: 4px;
    }
    .value {
        font-family: var(--font-display);
        font-size: 1rem;
        letter-spacing: 0.01em;
        text-transform: uppercase;
        color: var(--foreground);
        line-height: 1.25;
    }
    .value.cap, .sub.cap { text-transform: capitalize; }
    .sub {
        font-size: 0.8rem;
        color: var(--muted-foreground);
    }
    .badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 6px;
    }
    .badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 8px;
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent-foreground);
        background: color-mix(in oklch, var(--accent) 30%, transparent);
        border: 1px solid color-mix(in oklch, var(--accent) 60%, transparent);
        border-radius: 2px;
    }
    .action-bar {
        display: flex;
        gap: 10px;
        padding: 14px 16px calc(14px + env(safe-area-inset-bottom));
        border-top: 1px solid var(--border);
        background: color-mix(in oklch, var(--card) 92%, var(--primary) 8%);
    }
    .action-fav,
    .action-primary {
        height: 46px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-family: var(--font-mono);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        cursor: pointer;
        transition-property: transform, background, color;
        transition-duration: 140ms;
        transition-timing-function: ease;
    }
    .action-fav:active,
    .action-primary:active {
        transform: scale(0.96);
        transition-duration: 80ms;
    }
    .action-fav {
        flex: 0 0 auto;
        padding: 0 18px;
        background: transparent;
        color: var(--foreground);
        border: 1px solid var(--border);
        clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
    }
    @media (hover: hover) {
        .action-fav:hover {
            background: color-mix(in oklch, var(--primary) 8%, transparent);
        }
    }
    .action-fav.is-fav {
        color: oklch(0.7 0.2 30);
        border-color: color-mix(in oklch, oklch(0.7 0.2 30) 60%, transparent);
    }
    .action-fav.is-fav :global(svg) { fill: oklch(0.7 0.2 30); }

    .action-primary {
        flex: 1;
        background: var(--primary);
        color: var(--primary-foreground);
        clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
    }
    @media (hover: hover) {
        .action-primary:hover {
            background: color-mix(in oklch, var(--primary) 88%, white 0%);
            transform: translateY(-1px);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .action-primary, .hero-fav, .status-close, .action-fav { transition: none; }
        .action-primary:hover, .hero-fav:hover,
        .action-primary:active, .action-fav:active, .hero-fav:active, .status-close:active { transform: none; }
    }
</style>
