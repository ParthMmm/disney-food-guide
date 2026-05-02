<script lang="ts">
import "../app.css";
import { ModeWatcher } from "mode-watcher";
import { onMount } from "svelte";
import { favoritesStore } from "$lib/stores/favorites.svelte";
import { filtersStore } from "$lib/stores/filters.svelte";
import { viewPreferencesStore } from "$lib/stores/viewPreferences.svelte";

let { children } = $props();

const bodyFont = 'Asimovian, "Science Gothic", Manrope, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
const displayFont = 'Asimovian, "Science Gothic", Anton, Manrope, ui-sans-serif, sans-serif';

onMount(() => {
	favoritesStore.hydrate();
	filtersStore.hydrate();
	viewPreferencesStore.hydrate();
});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" />
</svelte:head>
<svelte:body style:--font-sans={bodyFont} style:--font-display={displayFont} />
<ModeWatcher defaultMode="dark" track />
{@render children?.()}
