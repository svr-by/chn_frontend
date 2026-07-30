# Agent instructions

Read these before changing frontend code:

1. **`.cursor/rules/project-core.mdc`** — always-on constraints
2. **`.cursor/rules/`** — scoped conventions:
   - `feature-module-structure.mdc` — `src/features/**`
   - `shared-lib-and-imports.mdc` — imports and `src/lib/`
   - `react-feature-patterns.mdc` — feature UI patterns
   - `testing.mdc` — `*.test.ts(x)`
3. **`docs/developer-guide.md`** — architecture, auth, permissions, adding a feature module

## Quick reference

- Path alias: `@/` → `src/`
- Feature layout template: `src/features/quotes/`
- Cross-feature utilities: `src/lib/`
- Test helpers: `src/test/render.tsx`, `src/test/fixtures.ts`
- Do not edit `src/api/generated/` (run `npm run codegen`)
