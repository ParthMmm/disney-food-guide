<script lang="ts">
import FoodGuide from "./FoodGuide.svelte";
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();

const itemCount = $derived(data.foodData.items.length);
</script>

<svelte:head>
    <title>May the 4th — Disneyland Park Star Wars Novelties | {itemCount} Items</title>
    <meta
        name="description"
        content="A Disneyland Park guide to the {itemCount} Star Wars novelties available in Anaheim — locations, mobile ordering, and offline access."
    />
    <meta name="theme-color" content="#0c1024" />
    <meta
        property="og:title"
        content="May the 4th — Disneyland Park Star Wars Novelties"
    />
    <meta
        property="og:description"
        content="Plot your Anaheim route: {itemCount} Disneyland Park Star Wars novelties logged."
    />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://disney-food-guide.parthmangrola.workers.dev/og-image.png" />
    <meta property="og:url" content="https://disney-food-guide.parthmangrola.workers.dev/" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Star Wars Day Eats — May the 4th field guide" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="May the 4th — Disneyland Park Star Wars Novelties" />
    <meta name="twitter:description" content="A guide to Star Wars novelties at Disneyland Park in Anaheim." />
    <meta name="twitter:image" content="https://disney-food-guide.parthmangrola.workers.dev/og-image.png" />
</svelte:head>

<FoodGuide {data} />
