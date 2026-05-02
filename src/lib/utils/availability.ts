import type { FoodItem } from "$lib/types/types";

export type AvailabilityBadge = {
	date: string;
	label: string;
	title: string;
};

export const AVAILABILITY_BADGES: AvailabilityBadge[] = [
	{ date: "2026-05-04", label: "✨", title: "Available on May the 4th" },
	{ date: "2026-05-31", label: "🗓️", title: "Available through May" },
];

export function isAvailableOn(item: FoodItem, date: string): boolean {
	const { startDate, endDate } = item.availability;
	const target = Date.parse(date);
	const start = startDate ? Date.parse(startDate) : null;
	const end = endDate ? Date.parse(endDate) : null;
	return (start === null || target >= start) && (end === null || target <= end);
}

export function getActiveAvailabilityBadges(item: FoodItem): AvailabilityBadge[] {
	return AVAILABILITY_BADGES.filter((b) => isAvailableOn(item, b.date));
}

export function formatDate(date: string): string {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function availabilityLabel(item: FoodItem): string {
	const { startDate, endDate } = item.availability;
	const start = startDate ? formatDate(startDate) : "Now";
	const end = endDate ? formatDate(endDate) : "while supplies last";
	return `${start} — ${end}`;
}
