<script lang="ts">
import "../app.css";
import "dialkit/styles.css";
import { DialRoot, createDialKit } from "dialkit/svelte";
import { ModeWatcher } from "mode-watcher";
import { onMount } from "svelte";
import { favoritesStore } from "$lib/stores/favorites.svelte";
import { filtersStore } from "$lib/stores/filters.svelte";
import { viewPreferencesStore } from "$lib/stores/viewPreferences.svelte";

let { children } = $props();

const FONT_STACKS = {
	manrope: "Manrope, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
	science: '"Science Gothic", Manrope, ui-sans-serif, system-ui, sans-serif',
	anton: 'Anton, "Science Gothic", Manrope, ui-sans-serif, sans-serif',
	system: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
} as const;

const typography = createDialKit("Typography", {
	bodyFont: {
		type: "select",
		options: [
			{ value: "manrope", label: "Manrope" },
			{ value: "science", label: "Science Gothic" },
			{ value: "system", label: "System Sans" },
		],
		default: "manrope",
	},
	displayFont: {
		type: "select",
		options: [
			{ value: "anton", label: "Anton" },
			{ value: "science", label: "Science Gothic" },
			{ value: "manrope", label: "Manrope" },
			{ value: "system", label: "System Sans" },
		],
		default: "anton",
	},
});

let bodyFont = $derived(FONT_STACKS[typography.bodyFont as keyof typeof FONT_STACKS]);
let displayFont = $derived(FONT_STACKS[typography.displayFont as keyof typeof FONT_STACKS]);

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
<DialRoot />
