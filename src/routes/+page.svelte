<script lang="ts">
import FoodGuide from "./FoodGuide.svelte";
import type { PageData } from "./$types";

export let data: PageData;
</script>

<FoodGuide {data} />
