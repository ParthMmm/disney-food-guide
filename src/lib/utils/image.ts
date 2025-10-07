export function optimizeImageUrl(
	url: string | null,
	width = 400,
): string | null {
	if (!url) return null;

	return `${url}?w=${width}&q=80&fm=webp`;
}
