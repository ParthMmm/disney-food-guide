# Performance & Offline Audit — SvelteKit on Cloudflare Workers

Date: 2025-10-07

This document captures the current performance, PWA/offline status, iOS considerations, and a prioritized plan to make the app offline‑friendly and highly performant.

## Snapshot

- Build target: `vite build` (SvelteKit + adapter-cloudflare)
- PWA: `@vite-pwa/sveltekit` with `generateSW` (build still exits early in local sandbox; see Progress)
- Notable bundle artifacts (client):
  - `nodes/2.*.js` ≈ 390.01 kB (gzip ≈ 93.40 kB) — main page chunk
  - `chunks/2l-ZXZyI.js` ≈ 32.19 kB (gzip ≈ 12.60 kB)
  - `chunks/CES5VKwt.js` ≈ 30.85 kB (gzip ≈ 12.13 kB)
  - Fonts: multiple Inter subsets (latin, latin-ext, cyrillic, greek, vietnamese) totaling ~200 kB+ of woff2
- Data: now served from `/data/food.json` (static asset fetched during prerender); re-run build to confirm chunk shrinkage
- Images: remote at `https://disneyparksblog.com/app/uploads/...`; runtime caching now configures CacheFirst for this host
- Dev plugin included in prod: `vite-plugin-devtools-json` (now applied only in dev builds)

## PWA / Offline Status

- Current status: Service worker generation fails during build; offline will not work until addressed.
- Error summary:
  - `Unable to write the service worker file ... Unfinished hook action(s) on exit: (terser) renderChunk`
- Manifest: present in `static/manifest.json` with 192/512 icons; no 180×180 iOS icon yet. `manifest: false` in Vite PWA means the static manifest is used as-is.

## Key Issues (Root Causes)

1) Large main page chunk (partially mitigated)
   - JSON data now fetched from `/data/food.json`; rerun build to validate size reduction.
   - Remaining contributors: many UI primitives + full Inter font family subsets.
2) SW build failure (needs rerun outside restricted sandbox)
   - Workbox/terser hook previously caused `generateSW` to abort. Updated config disables minification and adds resilience, but build still exits early in local sandbox (see Progress).
3) Runtime caching coverage
   - CacheFirst handlers now exist for Google Fonts and `disneyparksblog.com` images; need to validate cache population once SW build succeeds.
4) Mobile/iOS ergonomics
   - Prefetch mode `hover` (ineffective on touch). Long lists render fully with transitions and popovers.
5) CDN/edge caching
   - No explicit asset/HTML caching strategy documented for Cloudflare Workers in this repo.

## Prioritized Fixes (Action Items)

1. Move JSON out of JS bundle and prerender the page
   - Create `static/data/food.json` and fetch it in `+page.ts`. Enable prerender.
   - Expected impact: smaller page chunk (≈50–100 kB reduction), faster hydration.

2. Make service worker build resilient and expand runtime caching
   - Add Workbox options to avoid the terser hook issue and to cache remote images and fonts.
   - Add `CacheFirst` for `fonts.gstatic.com` and `disneyparksblog.com/app/uploads/` with sensible TTLs.

3. Fonts: prefer system font on iOS (and globally)
   - Fastest path: use the native system stack (San Francisco on iOS) to eliminate ~200 kB of font payload and improve first text paint.
   - Alternative: if brand consistency requires Inter, keep a minimal `latin`-only import.
   - In both cases, ensure `font-display: swap` behavior for non-system fonts.

4. Improve iOS experience
   - Switch SvelteKit prefetch to `tap`.
   - Add 180×180 Apple Touch icon; ensure manifest covers iOS needs.
   - Consider `preconnect` to image origin.

5. Reduce list rendering cost
   - Add `content-visibility: auto; contain-intrinsic-size` on list items or sections.
   - Optionally virtualize the list in condensed mode.
   - Keep transitions minimal and honor `prefers-reduced-motion`.

6. Cloudflare caching
   - If SSR remains: set cache headers for hashed assets (1y immutable) and HTML (e.g., 10m + stale-while-revalidate).
   - If fully prerendered: assets will be static; still add explicit headers if possible.

## Progress (2025-10-07)

- ✅ Food dataset moved to `/data/food.json`; `src/routes/+page.ts` now prerenders and fetches static JSON.
- ✅ Workbox config updated (clients claim, skip waiting, navigation preload, CacheFirst for fonts/images); `devtoolsJson` limited to dev builds to avoid prod bloat.
- ⏳ `bun run build` (2025-10-07) completes bundling but aborts while the Cloudflare worker preview tries to listen on `127.0.0.1`, triggering `Error: listen EPERM`. Need to rerun outside the sandbox to confirm `generateSW` finishes and writes `sw.js`.
- ⏳ Bundle size impact remains unmeasured; inspect `.svelte-kit/output/client/_app/immutable/nodes/2.*.js` after a successful build.

## Concrete Changes (Proposed Patches)

### 1) Fetch JSON and prerender

- Move file to `static/data/food.json` (same contents as current `src/lib/assets/disneyland_halloween_food.json`).
- Update `src/routes/+page.ts`:

```ts
// src/routes/+page.ts
import type { PageLoad } from "./$types";

export const prerender = true;

export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch('/data/food.json');
  const foodData = await res.json();
  return { foodData };
};
```

### 2) PWA: robust SW + runtime caching

- Update `vite.config.ts` inside `SvelteKitPWA({ ... })`:

```ts
SvelteKitPWA({
  strategies: 'generateSW',
  registerType: 'autoUpdate',
  manifest: false,
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json}'],
    clientsClaim: true,
    skipWaiting: true,
    cleanupOutdatedCaches: true,
    navigationPreload: true,
    minify: false, // avoids terser hook in this env; re-enable later if desired
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\//i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts',
          expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
          cacheableResponse: { statuses: [0, 200] }
        }
      },
      {
        urlPattern: /^https:\/\/disneyparksblog\.com\/app\/uploads\//i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'remote-images',
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 60 },
          cacheableResponse: { statuses: [0, 200] }
        }
      }
    ]
  },
  devOptions: { enabled: true, type: 'module' }
})
```

- Optionally add an offline page (`/offline`) and `navigateFallback: '/offline'`.

### 3) Fonts: system font (preferred) or Inter latin-only

Option A — System font everywhere (recommended for iOS performance)

- Remove the Inter import in `src/routes/+layout.svelte`:

```ts
// before
import "@fontsource-variable/inter";
// after: remove the import line entirely
```

- Update the font stack in `src/app.css` for both `:root` and `.dark`:

```css
--font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

- (Optional) Remove `@fontsource-variable/inter` from `package.json` deps.

Option B — Hybrid: keep Inter latin-only for non‑iOS platforms

- Keep import small in `src/routes/+layout.svelte`:

```ts
import "@fontsource-variable/inter/latin.css";
```

- Prefer system stack first, Inter second, in `src/app.css`:

```css
--font-sans: ui-sans-serif, system-ui, -apple-system, 'Inter', BlinkMacSystemFont,
  'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### 4) Mobile prefetch and iOS icons

- `src/app.html`

```html
<!-- before -->
<body data-sveltekit-preload-data="hover">
<!-- after -->
<body data-sveltekit-preload-data="tap">
```

- Add a `static/apple-touch-icon.png` (180×180) and include:

```html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

- Consider:

```html
<link rel="preconnect" href="https://disneyparksblog.com" crossorigin>
```

### 5) List rendering and images

- Add content-visibility to cards/sections (CSS example):

```css
.item-card { content-visibility: auto; contain-intrinsic-size: 200px 300px; }
```

- `src/lib/components/FoodImage.svelte`: add responsive `srcset/sizes` and offline fallback `onerror` that shows the emoji placeholder.

### 6) Cloudflare cache headers (SSR path)

- Introduce `src/hooks.server.ts` with a `handle` that sets cache headers for static assets and HTML. For example:

```ts
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event, { filterSerializedResponseHeaders: () => true });
  const url = new URL(event.request.url);
  const isAsset = /\/_app\/immutable\//.test(url.pathname);

  if (isAsset) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    response.headers.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=30');
  }
  return response;
};
```

> If fully prerendered, most files are static; cache headers are still beneficial at the edge.

## Dependency Hygiene

- Only include `devtoolsJson()` in dev (e.g., `{ apply: 'serve' }`).
- Remove unused deps (`workbox-window`, `@internationalized/date`, `@fontsource/anton` if not used).
- If moving to system font, remove `@fontsource-variable/inter` entirely.
- Prefer a single icon library (`lucide-svelte`) to avoid duplication.

## Manual QA (Checklist)

- Cold load on iOS Safari and installed PWA (LTE): first paint < 1s, no CLS.
- Scroll long lists; toggle filters quickly; ensure smooth interactions (no dropped frames).
- Go offline and reload: data renders from cache, images show cached or emoji placeholders; navigation works (or offline page shown).
- SW update flow: deploy a change, confirm `autoUpdate` fetches new SW and activates (`skipWaiting/clientsClaim`).

## Rollout Plan

1. Apply patches for JSON fetch + prerender and PWA workbox config.
2. Switch to system font (preferred) or Inter latin-only, and change prefetch to `tap`.
3. Add iOS icon and (optional) offline page.
4. Implement list `content-visibility`; consider virtualization next.
5. Rebuild and verify:
   - `bun run build` (ensures SW is generated)
   - Inspect `.svelte-kit/output/client/_app/immutable/nodes/2.*.js` for size reduction
   - Test offline in local preview and on iOS device/simulator
6. Triage remaining heavy chunks (lazy-load non-critical UI primitives if needed).

---

If you want, I can implement steps 1–3 now and re-run a production build to validate bundle sizes and offline behavior.
