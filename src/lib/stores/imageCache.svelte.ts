const loadedImages = $state(new Set<string>());

export const imageCacheStore = {
	markAsLoaded(url: string) {
		loadedImages.add(url);
	},
	isLoaded(url: string): boolean {
		return loadedImages.has(url);
	},
};
