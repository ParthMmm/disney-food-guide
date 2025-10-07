import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			strategies: "generateSW",
			registerType: "autoUpdate",
			manifest: false,
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,json}"],
				clientsClaim: true,
				skipWaiting: true,
				navigationPreload: true,
				cleanupOutdatedCaches: true,
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\//i,
						handler: "CacheFirst",
						options: {
							cacheName: "gstatic-fonts",
							expiration: {
								maxEntries: 20,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						urlPattern: /^https:\/\/disneyparksblog\.com\/app\/uploads\//i,
						handler: "CacheFirst",
						options: {
							cacheName: "remote-images",
							expiration: {
								maxEntries: 200,
								maxAgeSeconds: 60 * 60 * 24 * 60,
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
				],
			},
			devOptions: {
				enabled: true,
				type: "module",
			},
		}),
		devtoolsJson({
			apply: "serve",
		}),
	],
});
