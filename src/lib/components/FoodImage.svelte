<script lang="ts">
import { optimizeImageUrl } from "$lib/utils/image";
import { imageCacheStore } from "$lib/stores/imageCache.svelte";

type Props = {
	src: string | null;
	alt: string;
	width?: number;
	class?: string;
	name?: string;
	description?: string | null;
	category?: string;
	itemType?: string | null;
};

let {
	src,
	alt,
	width = 400,
	class: className = "",
	name = "",
	description = null,
	category = "",
	itemType = null,
}: Props = $props();

let img: HTMLImageElement | undefined = $state();
let loaded = $state(false);
let inView = $state(false);

const optimizedSrc = $derived(optimizeImageUrl(src, width));
const isCached = $derived(
	optimizedSrc ? imageCacheStore.isLoaded(optimizedSrc) : false,
);

function getEmojiForFood(): string {
	const searchText =
		`${name} ${description || ""} ${category} ${itemType || ""}`.toLowerCase();

	if (searchText.includes("cookie")) return "🍪";
	if (searchText.includes("donut") || searchText.includes("doughnut"))
		return "🍩";
	if (searchText.includes("cupcake")) return "🧁";
	if (searchText.includes("cake") && !searchText.includes("cupcake"))
		return "🍰";
	if (searchText.includes("pie")) return "🥧";
	if (searchText.includes("churro")) return "🥨";
	if (searchText.includes("pretzel")) return "🥨";
	if (searchText.includes("ice cream") || searchText.includes("frozen"))
		return "🍦";
	if (searchText.includes("candy") || searchText.includes("lollipop"))
		return "🍭";
	if (
		searchText.includes("chocolate") &&
		!searchText.includes("cake") &&
		!searchText.includes("cookie")
	)
		return "🍫";
	if (searchText.includes("popcorn")) return "🍿";
	if (searchText.includes("pumpkin")) return "🎃";
	if (searchText.includes("apple") && !searchText.includes("pineapple"))
		return "🍎";

	if (searchText.includes("beer")) return "🍺";
	if (searchText.includes("wine")) return "🍷";
	if (
		searchText.includes("cocktail") ||
		searchText.includes("margarita") ||
		searchText.includes("mojito")
	)
		return "🍹";
	if (searchText.includes("cider")) return "🧃";
	if (
		searchText.includes("coffee") ||
		searchText.includes("latte") ||
		searchText.includes("espresso")
	)
		return "☕";
	if (searchText.includes("tea")) return "☕";
	if (
		searchText.includes("soda") ||
		(searchText.includes("soft drink") && !searchText.includes("alcohol"))
	)
		return "🥤";

	if (searchText.includes("burger")) return "🍔";
	if (searchText.includes("pizza")) return "🍕";
	if (searchText.includes("taco")) return "🌮";
	if (searchText.includes("burrito") || searchText.includes("wrap"))
		return "🌯";
	if (searchText.includes("hot dog")) return "🌭";
	if (searchText.includes("salad")) return "🥗";
	if (searchText.includes("sandwich")) return "🥪";
	if (searchText.includes("pancake") || searchText.includes("waffle"))
		return "🥞";
	if (searchText.includes("cheese") && !searchText.includes("cake"))
		return "🧀";
	if (searchText.includes("bread") || searchText.includes("baked")) return "🍞";

	if (category.includes("beer")) return "🍺";
	if (category.includes("wine") || category.includes("cider")) return "🍷";
	if (category.includes("cocktail")) return "🍹";
	if (category.includes("coffee") || category.includes("tea")) return "☕";
	if (category.includes("churro")) return "🥨";
	if (category.includes("frozen-dessert")) return "🍦";
	if (category.includes("baked-dessert")) return "🍰";
	if (category.includes("dessert")) return "🍰";
	if (category.includes("salad")) return "🥗";
	if (category.includes("trinkets")) return "🎁";
	if (
		category.includes("alcoholic-beverage") ||
		category.includes("hard-seltzer")
	)
		return "🍹";

	return "🍴";
}

const fallbackEmoji = $derived(getEmojiForFood());

$effect(() => {
	if (!img || !optimizedSrc) return;

	if (isCached) {
		inView = true;
		return;
	}

	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				inView = true;
				observer.disconnect();
			}
		},
		{ rootMargin: "50px" },
	);

	observer.observe(img);
	return () => observer.disconnect();
});
</script>

{#if optimizedSrc}
    <img
        bind:this={img}
        src={inView ? optimizedSrc : ""}
        {alt}
        loading="lazy"
        decoding="async"
        class="{className} {loaded || isCached ? 'loaded' : ''}"
        onload={() => {
			loaded = true;
			if (optimizedSrc) {
				imageCacheStore.markAsLoaded(optimizedSrc);
			}
		}}
    />
{:else}
    <div class="placeholder {className}">
        <span>{fallbackEmoji}</span>
    </div>
{/if}

<style>
    img {
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
    }

    img.loaded {
        opacity: 1;
    }

    .placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #271c15;
        color: #999;
        font-size: 2rem;
    }
</style>
