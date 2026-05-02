<script lang="ts">
import FoodGuide from "./FoodGuide.svelte";
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();

const itemCount = $derived(data.foodData.items.length);
</script>

<svelte:head>
    <title>May the 4th — Star Wars Nite Foodie Transmission | {itemCount} Provisions</title>
    <meta
        name="description"
        content="A field guide to the {itemCount} treats, drinks, and trinkets dropping for Star Wars Day — tags, mobile ordering, and offline access."
    />
    <meta name="theme-color" content="#0c1024" />
    <meta
        property="og:title"
        content="May the 4th — Star Wars Nite Foodie Transmission"
    />
    <meta
        property="og:description"
        content="Plot your route: {itemCount} provisions logged for Star Wars Day."
    />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://disney-food-guide.parthmangrola.workers.dev/og-image.png" />
    <meta property="og:url" content="https://disney-food-guide.parthmangrola.workers.dev/" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Star Wars Day Eats — May the 4th field guide" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="May the 4th — Star Wars Nite Foodie Transmission" />
    <meta name="twitter:description" content="A field guide to the treats, drinks & trinkets dropping for Star Wars Day." />
    <meta name="twitter:image" content="https://disney-food-guide.parthmangrola.workers.dev/og-image.png" />
</svelte:head>

<FoodGuide {data} />
