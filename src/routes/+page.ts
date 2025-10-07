import type { PageLoad } from "./$types";
import foodData from "$lib/assets/disneyland_halloween_food.json";

export const load: PageLoad = () => {
	return {
		foodData,
	};
};
