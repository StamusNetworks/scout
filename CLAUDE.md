# Project Conventions

## File Structure

- **`/common`** — Shared utilities and design system components that could be used in a separate project (design system primitives, generic utils).
- **`/features`** — Domain slices. Each feature contains its own API layer, hooks, context-specific primitives, reusable widgets, and utils.
- **`/pages`** — Page-level components. Implementation-specific components are colocated with their page. Pages compose from `common/` and `features/` primitives, hooks, and widgets.

## Code Style

- Prefer composition patterns over inheritance or deep prop drilling.

## Quality Checks

Always run before considering work done:

```sh
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
