<script lang="ts">
import FoodGuide from "./FoodGuide.svelte";
import type { PageData } from "./$types";

export let data: PageData;

const itemCount = data.foodData.items.length;
</script>

<svelte:head>
    <title>🎃 Disneyland Halloween Food Guide 2025 | {itemCount} Items</title>
    <meta
        name="description"
        content="Browse {itemCount} seasonal food and drink items across Disneyland and Disney California Adventure with prices, locations, tags, and mobile ordering details."
    />
    <meta property="og:title" content="Disneyland Halloween Food Guide 2025" />
    <meta
        property="og:description"
        content="Plan your Disneyland visit with {itemCount} seasonal snacks, meals, and drinks, all available offline in the FOM guide."
    />
</svelte:head>

<FoodGuide {data} />
