# Repository Guidelines

## Project Structure & Modules
- App code lives in `src/`.
- Routes and pages: `src/routes/` (e.g., `+page.svelte`, `+layout.svelte`).
- Reusable code: `$lib/` → `src/lib/` (components, stores, utils, types, assets).
  - Components: `src/lib/components/**`
  - Stores: `src/lib/stores/*.svelte.ts`
  - Utilities: `src/lib/utils.ts` (includes `cn()`)
  - Types: `src/lib/types/types.ts`
- Static assets served at root: `static/` (icons, manifest, robots).
- Generated files: `.svelte-kit/` (do not edit).

## Build, Dev, and Checks
- Dev server: `bun run dev` (Vite + HMR).
- Build: `bun run build` (SvelteKit with Cloudflare adapter).
- Preview build: `bun run preview`.
- Type check: `bun run check` (runs `svelte-kit sync` + `svelte-check`).
- Format: `bun run format` (Biome write). Check-only: `bun run format:check`.

## Coding Style & Naming
- Formatter: Biome (tabs, double quotes, organize imports).
- TypeScript: strict; avoid `any` (use `unknown` when necessary).
- Imports: use `$lib/...` alias for internal modules.
- Svelte 5 runes only: `$state`, `$derived`, `$props()`, `$bindable()` (no Options API).
- Component structure: `<script module>` for types/exports; `<script>` for logic.
- Props: `let { prop }: { prop: Type } = $props()`.
- Naming: camelCase (vars/functions), PascalCase (components/types/files).
- Styling: Tailwind 4 utility classes; scope extras in `<style>` with `:global()` when needed.
- Browser APIs: guard with `browser` from `$app/environment`.

## Testing Guidelines
- No automated tests configured. For PRs, include manual QA notes: steps, browsers/devices, and expected vs actual.
- Proposing tests? Open an issue first to agree on tooling and structure before introducing a runner.

## Commit & PR Guidelines
- Commits: imperative mood, concise subject (e.g., “Add filter store”, “Fix drawer height”).
- Reference issues in body when applicable; explain the why, not just the what.
- Before opening a PR: run `bun run check` and `bun run format:check`.
- PRs should include: purpose, scope, screenshots/video for UI changes, and reproduction/QA steps. Keep diffs focused.

## Security & Configuration
- Do not commit secrets. Use Cloudflare environment configuration; keep private values out of the repo.
- Validate data sources and JSON parsing with explicit null/undefined checks and try/catch where appropriate.
