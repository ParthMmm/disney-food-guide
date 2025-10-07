import { error } from "@sveltejs/kit";
import type { FoodGuideData } from "$lib/types/types";
import type { PageLoad } from "./$types";

export const prerender = true;

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch("/data/food.json");

	if (!response.ok) {
		throw error(response.status, "Failed to load food guide data");
	}

	const foodData = (await response.json()) as FoodGuideData;

	return {
		foodData,
	};
};
