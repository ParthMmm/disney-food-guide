# Performance & Offline Audit — SvelteKit on Cloudflare Workers

**Last Updated:** 2025-10-07  
**Latest Lighthouse (mobile):** [PageSpeed Insights](https://pagespeed.web.dev/analysis/https-disney-food-guide-parthmangrola-workers-dev/bnrzjkp5fq?form_factor=mobile) — captured Oct 6, 2025 23:01 PDT on emulated Moto G Power with Slow 4G throttling

This audit tracks the current performance, offline readiness, and iOS/PWA experience for the Disneyland seasonal food guide. The goal is to ship an app that installs cleanly as a PWA, works offline on iOS, and maintains fast paint/interactivity scores on constrained networks.

---

## Executive Summary
- We shipped the static data set to `static/data/food.json` (133 KB) and prerender the index route, trimmed custom fonts to a system stack, and updated the shell with iOS-friendly hints—but the service worker build still aborts before emitting `sw.js`.
- Latest Lighthouse run regressed TBT to **420 ms** and LCP to **2.6 s** because remote hero imagery is not optimized and the main chunk still ships 279 KB of JavaScript.
- Next focus: unblock the service worker build, optimise remote images, debounce synchronous stores, and lazy-load drawers/sheets. Medium-term tasks include adding cache headers at the edge and an offline fallback experience.

---

## Snapshot (2025-10-07)
- **Build command:** `bun run build` → SvelteKit + adapter-cloudflare + @vite-pwa/sveltekit (fails late with `Error: listen EPERM 127.0.0.1`, so no `sw.js` is written). 
- **Client bundle highlights (latest local build):**
  - `_app/immutable/nodes/2.CPWXusW0.js` — **279.07 KB** (gzip 78.32 KB)
  - `_app/immutable/chunks/Biw_043O.js` — 30.88 KB (gzip 12.14 KB)
  - `_app/immutable/chunks/N_G-7yBZ.js` — 31.80 KB (gzip 12.48 KB)
- **Core Web Vitals (mobile):** FCP 1.8 s, LCP 2.6 s, TBT 420 ms, CLS 0, Speed Index 3.5 s.
- **PWA manifest:** `static/manifest.json` with 192/512 icons; `app.html` now references the new `/apple-touch-icon-180.png` alongside `/icon-512.png`.
- **Prefetch:** `data-sveltekit-preload-data="tap"` (better for iOS touch devices).
- **Data:** 200 menu items embedded in `static/data/food.json`; remote imagery served from `https://disneyparksblog.com/app/uploads/...`.

---

## PWA / Offline Status
- `@vite-pwa/sveltekit` is configured for `generateSW` with runtime caching for Google Fonts and Disney Parks Blog images. `bun run build` still aborts when the Cloudflare preview worker attempts to bind to 127.0.0.1 inside the sandbox, so no `sw.js` is emitted. Offline currently fails.
- `registerType: "autoUpdate"`, `clientsClaim`, `skipWaiting`, and `navigationPreload` are set, but we must verify that the generated service worker reaches production and handles navigations before we claim offline support.
- No offline fallback route (`/offline`) is present; navigation failures surface the default fetch error.

---

## Key Findings

1. **Remote image delivery is the dominant LCP drag.**  
   `FoodImage.svelte` rewrites URLs via `optimizeImageUrl`, but Disney Parks Blog ignores the appended `?w=...&fm=webp` query params, so the browser still downloads large JPEGs/PNGs. The component also defers setting `src` until an IntersectionObserver fires and omits intrinsic `width`/`height`, forcing layout shifts and additional style recalculations. Lighthouse flags 549 KiB of potential savings and delayed LCP request discovery.

2. **Main chunk is still 279 KB and eagerly bundles optional UI.**  
   `FoodGuide.svelte` statically imports the filter drawer, detail drawer, and all Bits UI primitives. Category sections render full lists with transitions, so nothing is code split. The dataset (200 items) is filtered synchronously on each state change, and derived reducers rebuild large objects on every reactive cycle.

3. **Main-thread blocking comes from synchronous stores and storage writes.**  
   `filtersStore` and other stores write to `localStorage` on every mutation without debounce, and they rebuild `Set` instances plus JSON-serialize on each click. Combined with synchronous filtering, Lighthouse now reports 420 ms TBT with four long tasks.

4. **Offline build still fails in the sandboxed environment.**  
   Even after removing deprecated Workbox options, `bun run build` stops when the Cloudflare preview worker attempts to bind to `127.0.0.1`, so `sw.js` never lands and offline mode cannot be validated.

5. **Cache headers are absent.**  
   Neither the worker nor static hosting sets explicit `Cache-Control` headers. Immutable assets are recalculated on repeat visits, and HTML lacks `stale-while-revalidate` or SWR directives.

---

## Recommended Action Plan

### Phase 0 — Unblock offline build (same day)
- Run `bun run build` outside the restricted sandbox (Cloudflare Worker preview needs socket capability) and confirm `sw.js` lands in `.svelte-kit/output/client`. Commit the artifact path or adjust CI to run without preview.
- Add a smoke test (`bun run preview --mode production`) to ensure the service worker registers before merging future optimizations.

### Phase 1 — Quick Wins (2–3 focused hours)
- [x] Update `src/app.html` (prefetch `tap`, Disney preconnect, fonts DNS hint, Apple touch icon) — shipped 2025-10-07.
- [x] Trim fonts by switching to the system stack and updating `--font-sans` — shipped 2025-10-07.
- [x] Consolidate icon usage to `lucide-svelte` and remove the duplicate package — shipped 2025-10-07.
- [x] Add `<svelte:head>` metadata on the home route — shipped 2025-10-07.
- [ ] Add missing accessibility labels (e.g., filter trigger) and verify Lighthouse accessibility delta.

### Phase 2 — Image & caching improvements (1 day)
- Add an images optimizer step:
  - For remote Disney images, proxy through a Cloudflare Images Worker or store optimized copies under `static/images` with a build script that generates WebP/AVIF and responsive widths.
  - Update `FoodImage.svelte` to emit `width`, `height`, `sizes`, and `srcset`, fall back gracefully, and drop the extra IntersectionObserver in favour of native `loading="lazy"` once responsive sources exist.
- Extend Workbox runtime caching with proper `maxAgeSeconds`/`maxEntries` for the new image URLs. Consider `StaleWhileRevalidate` for non-critical assets.
- Add `src/hooks.server.ts` (or Cloudflare worker middleware) to set:
  - `Cache-Control: public, max-age=31536000, immutable` for `/_app/immutable/`.
  - `Cache-Control: public, max-age=86400` for other static assets.
  - `Cache-Control: public, max-age=600, stale-while-revalidate=60` for HTML if SSR stays enabled.

### Phase 3 — JavaScript load and TBT (1–2 days)
- Lazy-load heavy components with dynamic imports in `FoodGuide.svelte` (`FilterSheet`, `ItemDetailDrawer`, analytics overlays, etc.).
- Debounce `localStorage` writes inside `filtersStore`/`favoritesStore` using `setTimeout` or requestIdleCallback, and guard long iterations during hydration with `browser` checks.
- Introduce `content-visibility: auto; contain-intrinsic-size` on grid/list containers to reduce layout cost in condensed mode. Respect `prefers-reduced-motion` and shorten slide transitions to limit forced reflows.
- Measure derived store work; cache `items` by category once per load instead of rebuilding inside each reactive statement.

### Phase 4 — Polish & monitoring (as needed)
- Add an offline fallback route and show cached data when remote images fail (use the emoji placeholder already defined).
- Wire bundle analysis via `rollup-plugin-visualizer` and capture budgets (bundle < 200 KB, font payload < 80 KB, TBT < 200 ms).
- Set up continuous monitoring: scheduled Lighthouse runs (mobile + desktop) and error tracking for SW registrations on iOS Safari.

---

## Detailed Recommendations

### Images
- Create a build-time script (Node or Wrangler Pages Function) that downloads Disney Parks Blog assets, generates responsive derivatives (320w/480w/720w), and stores them in `static/images`. Serve via `<picture>` with WebP/AVIF plus JPEG fallback.
- If hosting copies is not feasible, use a Cloudflare Worker to proxy and cache remote images with `imgix`-style query parameters, then point `FoodImage` to that worker origin.
- Add `sizes="(max-width: 640px) 95vw, 400px"` (tune as needed) and explicit `width`/`height`. Only keep the IntersectionObserver if you defer rendering of off-screen content; otherwise rely on native lazy loading.

### Fonts
- Preferred path: remove the Inter package entirely and rely on the platform stack (`system-ui`, `-apple-system`, `BlinkMacSystemFont`), which improves text paint on iOS and eliminates ~218 KB.
- If brand guidelines require Inter, import `@fontsource-variable/inter/latin.css` and set `font-display: swap`. Bundle only the weights actually used (`wght` axes) to keep payload under 60 KB.

### JavaScript & State
- Replace eager imports of drawers/sheets with dynamic imports triggered when the UI opens. Use suspense placeholders to avoid layout jumps.
- Cache expensive derived computations: pre-group items by category once (`memoizedItemsByCategory = Map`) and reuse that map instead of re-reducing on each filter change.
- Debounce filter persistence to 300 ms and skip serialisation if the state did not change. Consider storing only the diff (e.g., `selectedTags`) to minimise work.
- Audit the Bits UI bundle; tree-shake unused primitives or replace with lighter button/select variants where possible.

### Offline & PWA
- After the build succeeds, verify that `registerSW.js` pulls the generated worker and that Workbox precaches `/_app/immutable/` assets, `static/data/food.json`, and the manifest/icons.
- Add an `/offline` route that displays cached data and instructs users how to refresh. Configure Workbox `navigationFallback: '/offline'`.
- Ensure `ModeWatcher` does not run on the server (wrap in `if (browser)` if needed) to avoid hydration mismatches in the PWA context.
- Provide `apple-touch-startup-image` links for common iPhone/iPad resolutions if the PWA is a priority.

### Edge Caching / Cloudflare Workers
- In `wrangler.toml` or `hooks.server.ts`, add cache-control logic plus `CF-Cache-Status` logging. Consider using `HTMLRewriter` to inject `Cache-Control` headers for responses that come from prerendered pages.
- Evaluate Cloudflare KV/Durable Object storage if you later fetch live data; ensure offline caching stays intact when dynamic content arrives.

---

## Manual QA Checklist
- [ ] `bun run build && bun run preview --mode production` completes and `sw.js` is present.
- [ ] Install as PWA on iOS (Safari 17+): check icon, splash, status bar colour, offline navigation.
- [ ] Cold mobile load (Slow 4G) achieves FCP ≤ 1.6 s and LCP ≤ 2.1 s after image optimisation.
- [ ] TBT ≤ 200 ms during heavy filter interaction; long list scroll maintains 60 fps.
- [ ] Offline reload shows cached data and fallback images; navigation fallback page works.
- [ ] Screen readers announce the page title, filter controls expose labels, and colour contrast passes.

---

## Suggested Timeline
- **Week 1:** Phase 0 + Phase 1 (fonts, prefetch, icons, metadata, SW build fix).
- **Week 2:** Phase 2 (image pipeline, caching headers) with post-deploy Lighthouse verification.
- **Week 3:** Phase 3 refinements (code splitting, storage debounce, content-visibility). Treat Phase 4 items as backlog after monitoring results.

---

## References
- SvelteKit performance guide: https://svelte.dev/docs/kit/performance
- SvelteKit PWA documentation: https://vite-pwa-org.netlify.app/frameworks/sveltekit.html
- Web.dev image optimisation: https://web.dev/learn-performance/optimize-lcp/
- Web.dev offline patterns: https://web.dev/offline-cookbook/
- Apple PWA design checklist: https://developer.apple.com/design/human-interface-guidelines/app-icons

---

**Status:** Phase 0 pending (needs unrestricted build); Phase 1 mostly shipped except accessibility label follow-up
