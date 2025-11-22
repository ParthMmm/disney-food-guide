# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Disneyland Holiday Food Guide** - A SvelteKit PWA deployed to Cloudflare Workers that displays Christmas and Holiday food items at Disneyland Resort. Built with Svelte 5, Tailwind CSS 4, and bits-ui components.

## Development Commands

**Development server:**
```bash
bun run dev
```

**Type checking:**
```bash
bun run check           # One-time check
bun run check:watch     # Watch mode
```

**Code formatting (Biome):**
```bash
bun run format          # Format and write
bun run format:check    # Check only
```

**Build for production:**
```bash
bun run build           # Builds for Cloudflare Workers
```

**Preview production build:**
```bash
bun run preview
```

## Architecture

### Build Target & Deployment
- **Adapter:** `@sveltejs/adapter-cloudflare` - outputs to `.svelte-kit/cloudflare/_worker.js`
- **Wrangler config:** `wrangler.jsonc` (named "disney-food-guide")
- **Prerendering:** Home page (`src/routes/+page.ts`) is prerendered with `export const prerender = true`
- **Static data:** Food items served from `static/data/food.json` (fetched during prerender)

### PWA Configuration
- **Plugin:** `@vite-pwa/sveltekit` with `generateSW` strategy
- **Service worker:** Configured in `vite.config.ts` with:
  - Auto-update registration (`registerType: 'autoUpdate'`)
  - Runtime caching for Google Fonts and remote images (`disneyparksblog.com`)
  - Glob patterns cover all static assets (`**/*.{js,css,html,ico,png,svg,webp,json}`)
- **Manifest:** `static/manifest.json` (192x192 and 512x512 icons provided)
- **Current limitation:** SW generation may fail in restricted environments; see `PERFORMANCE_AUDIT.md` for details

### State Management (Svelte 5 Runes)
All state uses Svelte 5's new runes syntax (`$state`, `$derived`, `$props`):

**Stores (persistent):**
- `src/lib/stores/filters.svelte.ts` - Filter state with localStorage persistence
  - Search query, category, tags, price range, mobile order, dates, locations, favorites-only toggle
  - All methods automatically save to localStorage
- `src/lib/stores/favorites.svelte.ts` - Favorite items (Set of item IDs)
  - Methods: `toggle(id)`, `isFavorite(id)`, `clear()`, `count` getter

**Component state:**
- Main app state in `src/routes/FoodGuide.svelte`
- Uses `$derived.by()` for computed values (filteredItems, itemsByCategory, activeFilterCount)
- Reactive filtering happens entirely client-side

### Data Structure
See `DATA_README.md` for comprehensive schema documentation.

**Key types** (in `src/lib/types/types.ts`):
- `FoodGuideData` - Root object with metadata and items array
- `FoodItem` - Individual food/beverage item with 14 categories
- `FoodCategory` - Union of 14 category strings (e.g., "baked-dessert", "cocktail")
- `FoodTag` - Union of 31 filterable tags (e.g., "vegan", "pumpkin-spice", "character-themed")

**Data flow:**
1. `+page.ts` fetches `/data/food.json` during prerender
2. `FoodGuide.svelte` receives data via props
3. Filtering logic combines all active filters using Set operations
4. Results grouped by category for display

### Component Structure

**Main components:**
- `FoodGuide.svelte` - Main container with filtering logic
- `SearchHeader.svelte` - Search input with clear button
- `FilterSheet.svelte` - Mobile-first filter drawer (uses vaul-svelte Drawer, migrated to Svelte 5 snippets)
- `FoodItemCard.svelte` - Item card with image, price, tags, and favorite toggle
- `ItemDetailDrawer.svelte` - Full item details in a drawer
- `CategorySection.svelte` - Collapsible section grouping items by category (uses bits-ui Collapsible)
- `FoodImage.svelte` - Responsive image component with loading states and emoji fallbacks

**UI library:**
- Components in `src/lib/components/ui/` are from bits-ui (headless primitives)
- Styled with Tailwind CSS 4 and tailwind-variants
- Uses `clsx` and `tailwind-merge` for class composition (via `src/lib/utils.ts`)

### Styling & Fonts
- **CSS framework:** Tailwind CSS 4 (configured via `@tailwindcss/vite` plugin)
- **Fonts:**
  - Inter Variable (`@fontsource-variable/inter`) - currently imports all subsets (~200 kB)
  - Anton (`@fontsource/anton`) - may be unused
  - **Performance note:** Consider switching to system fonts or limiting to `latin.css` only (see `PERFORMANCE_AUDIT.md`)
- **Global styles:** `src/app.css` defines CSS variables for light/dark themes
- **Dark mode:** Managed by `mode-watcher` package

### Image Handling
- Remote images hosted at `https://disneyparksblog.com/app/uploads/`
- `FoodImage.svelte` provides:
  - Loading skeletons
  - Error fallback to emoji (🍽️)
  - Lazy loading with Intersection Observer
- PWA runtime caching configured for `CacheFirst` with 60-day expiry

## Code Style & Conventions

**Formatter:** Biome (not ESLint/Prettier)
- Indent style: tabs
- Quote style: double quotes
- Organizes imports automatically
- Linting is disabled in `biome.json`

**Svelte 5 patterns:**
- Use `$state` for reactive variables
- Use `$derived` or `$derived.by()` for computed values
- Use `$props()` for component props with types
- Prefer `{#snippet}` blocks over `{#if}` for conditional rendering in reusable UI
- `FilterSheet.svelte` and collapsible components migrated to snippets

**TypeScript:**
- Strict types for all data models
- Import types from `$lib/types/types`
- Use `PageData` types from `./$types` in routes

## Performance Considerations

See `PERFORMANCE_AUDIT.md` for detailed analysis and prioritized fixes.

**Current challenges:**
1. Large main chunk (~390 kB / 93 kB gzipped) - partially mitigated by moving data to static JSON
2. Full Inter font family imports (~200+ kB woff2)
3. Service worker build fails in restricted environments (Workbox terser hook issue)

**Optimization opportunities:**
- Prerendered home page with static JSON already implemented
- Runtime caching for fonts and images configured
- Consider system fonts on iOS for faster FCP
- Add `content-visibility: auto` to list items
- Lazy-load non-critical UI primitives if needed

## Common Patterns

**Adding a new filter:**
1. Add state to `filtersStore` in `src/lib/stores/filters.svelte.ts`
2. Update `DEFAULT_FILTERS` and `FilterState` interface
3. Add toggle/setter method and call `save()`
4. Update filtering logic in `FoodGuide.svelte` (within `filteredItems` derived)
5. Add UI controls in `FilterSheet.svelte`

**Working with favorites:**
```typescript
import { favoritesStore } from '$lib/stores/favorites.svelte';

// Toggle favorite
favoritesStore.toggle(item.id);

// Check if favorite
const isFav = favoritesStore.isFavorite(item.id);

// Get count
const count = favoritesStore.count;
```

**Filtering items:**
All filtering happens in `FoodGuide.svelte` using `$derived.by()`. The pattern:
```typescript
const filteredItems = $derived.by(() => {
  return items.filter((item) => {
    // Check each filter condition
    // Return false if item doesn't match
    // Return true if item passes all filters
  });
});
```

## Notes for AI Assistants

- This codebase uses **Svelte 5 runes** - do not use legacy `$:` reactive syntax
- The UI library is **bits-ui**, not shadcn-svelte (though similar patterns)
- **Bun** is the preferred package manager (not npm/pnpm/yarn)
- When modifying filters, always update both the store and the filtering logic
- Remote images may be slow/unavailable - `FoodImage.svelte` handles this gracefully
- The app is designed for mobile-first, touch-friendly interactions
