<script lang="ts">
import { Drawer as DrawerPrimitive } from "vaul-svelte";
import { cn } from "$lib/utils.js";

let {
	ref = $bindable(null),
	class: className,
	...restProps
}: DrawerPrimitive.OverlayProps = $props();
</script>

<DrawerPrimitive.Overlay
    bind:ref
    data-slot="drawer-overlay"
    class={cn("fixed inset-0 z-50 bg-black/50", className)}
    style="will-change:opacity transition: opacity 250ms cubic-bezier(0.33, 1, 0.68, 1);"
    {...restProps}
/>
