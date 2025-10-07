<script lang="ts">
import { Checkbox as CheckboxPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn, type WithoutChildren } from "$lib/utils.js";

type Props = WithoutChildren<CheckboxPrimitive.RootProps> & {
	children?: Snippet;
};

let {
	ref = $bindable(null),
	checked = $bindable(false),
	indeterminate = $bindable(false),
	class: className,
	children,
	...restProps
}: Props = $props();
</script>

<CheckboxPrimitive.Root
    bind:ref
    data-slot="checkbox"
    class={cn(
        "border-input dark:bg-input/30 data-[state=checked]:bg-primary/50 data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary/50 data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs peer flex size-4 shrink-0 items-center justify-center rounded-[4px] border outline-none transition-shadow focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
    )}
    bind:checked
    bind:indeterminate
    {...restProps}
>
    {#snippet children(args)}
        <div
            data-slot="checkbox-indicator"
            class="text-current transition-none"
        >
            <!-- {#if args.checked}
                <CheckIcon class="size-3.5" />
            {:else if args.indeterminate}
                <MinusIcon class="size-3.5" />
            {/if} -->
        </div>
        {@render children?.(args)}
    {/snippet}
</CheckboxPrimitive.Root>
