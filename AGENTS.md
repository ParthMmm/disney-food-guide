# Agent Guide

## Commands
- **Dev**: `bun run dev`
- **Build**: `bun run build`
- **Type check**: `bun run check`
- **Format**: `bun run format` (uses Biome)
- **Format check**: `bun run format:check`
- **No tests** configured in this project

## Code Style
- **Formatter**: Biome with tab indentation, double quotes
- **TypeScript**: Strict mode enabled, no explicit `any` types
- **Imports**: Organize imports automatically (Biome), use `$lib` alias for lib imports
- **Svelte**: Use Svelte 5 runes syntax (`$props()`, `$bindable()`, `$derived`, `$:`)
- **Components**: Script module for types/exports, script tag for component logic
- **Types**: Export all types, use strict typing, use union types for categories/tags
- **Naming**: camelCase for variables/functions, PascalCase for types/components
- **Utilities**: Use `cn()` from `$lib/utils` for conditional classes
- **Styling**: Component-scoped `<style>` tags or Tailwind classes via `tailwind-variants`
- **Error handling**: Check for null/undefined explicitly, use optional chaining

## Stack
SvelteKit + TypeScript + Tailwind + Biome + Cloudflare adapter
