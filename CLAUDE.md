# Project Conventions

See [`docs/architecture.md`](docs/architecture.md) for the full
contract: bounded contexts, the Anti-Corruption Layer at `api/`,
public-barrel discipline (`@/features/<context>` only — internals
in `api/` and `state/` are off-limits across features), the
state-placement decision tree, and the lint exceptions.

## File Structure

- **`/common`** — Shared utilities and design system components that could be used in a separate project (design system primitives, generic utils).
- **`/features`** — Bounded contexts. Each feature follows the canonical layout in `docs/architecture.md` §2 and exposes its public surface via `index.ts`.
- **`/routes`** — TanStack Router file-based routes. Routes are thin orchestrators — they own URL state, compose feature components, and pass plain values + change handlers down. No business logic.

## Code Style

- Prefer composition patterns over inheritance or deep prop drilling.
- Routes own URL/router state and pass plain values + change handlers down. Feature components stay router-agnostic and receive their state via props so they remain independently testable.

## Quality Checks

Always run before considering work done:

```sh
pnpm run fmt
pnpm run lint --fix
pnpm run check
```

Do not commit code with lint or TypeScript errors.

## Testing

Always include tests. Tests are colocated with the code they test.

- **vitest** for pure JS logic — Redux slices, utility functions, anything outside React scope.
- **react-testing-library** for components, using **msw** to mock network data.
  - Place mock data close to the API source it represents.
  - Make mock data reusable and maintainable across different tests.

## Network Queries

Whenever dealing with network queries, always handle all three states:

- **Loading** state
- **Error** state
- **Empty** state
