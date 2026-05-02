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
        content="A field guide to the {itemCount} treats, drinks, and trinkets dropping at Disney's Hollywood Studios for Star Wars Day — locations, tags, and mobile ordering, available offline."
    />
    <meta name="theme-color" content="#0c1024" />
    <meta
        property="og:title"
        content="May the 4th — Star Wars Nite Foodie Transmission"
    />
    <meta
        property="og:description"
        content="Plot your route through Black Spire Outpost: {itemCount} provisions logged for Star Wars Day at Disney's Hollywood Studios."
    />
</svelte:head>

<FoodGuide {data} />
