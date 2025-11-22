<script lang="ts">
import "../app.css";
import { ModeWatcher } from "mode-watcher";

let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href="/favicon.ico" />
</svelte:head>
<ModeWatcher defaultMode={"dark"} track={true} />
{@render children?.()}
