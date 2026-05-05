# Architecture

This document codifies the conventions for the Scout NDR frontend. It is the
contract every new feature, refactor, and PR must satisfy. Existing code that
predates these conventions is migrated incrementally; new code is held to the
target shape from day one.

The goals these conventions serve, in priority order:

1. Features can be tested without spinning up the whole app.
2. Business logic can be tested outside React for fast feedback.
3. State location (URL / local / Redux / cache) can be swapped without
   rewriting feature components.
4. Components are small and have a single responsibility.
5. Shared code has an obvious home.
6. Cross-feature coupling is explicit and visible.

---

## 1. Bounded contexts

Each top-level folder under `src/features/*` is a **bounded context**. A
bounded context owns its own:

- domain types (`Threat`, `Event`, `Host`, …)
- HTTP boundary (request/response shapes are translated here, not leaked)
- Redux state, if any
- React hooks
- domain components
- user-action workflows (`use-cases/`)

The same real-world concept may have different shapes in two contexts. A
`Host` in the **Host Insights** context (asset inventory) is not the same
shape as a `host_id` field appearing on a row in **Detection Events**. Do not
share types across contexts unless you are publishing them deliberately
through the public barrel.

Currently extracted contexts: `auth`, `tenancy`, `settings`, `dates`,
`query-filters`, `filter-sets`. The pre-migration `features/filtering/`
folder is gone — it split into `features/query-filters/` and
`features/filter-sets/`.

---

## 2. Folder shape (every context follows this)

```
src/features/<context>/
├── api/                         # HTTP boundary (Anti-Corruption Layer). Internal.
│   ├── <context>.api.ts         # RTK Query injectEndpoints
│   ├── <context>.dto.ts         # Server-shape Zod schemas. NOT exported from index.
│   └── <context>.transforms.ts  # toX(dto): X — domain ⇄ wire translation
├── model/                       # Domain types + pure helpers. Public via index.
│   └── <thing>.ts               # One concept per file (threat.ts, severity.ts)
├── definitions/                 # Static config records (filter defs, page configs).
│   └── <thing>.config.ts
├── state/                       # Redux slices, selectors, repository hooks. Internal.
│   ├── <context>.slice.ts
│   └── <context>.selectors.ts
├── builders/                    # Pure functions producing wire / qfilter strings.
│   └── build-<thing>.ts
├── hooks/                       # use<Verb><Noun>() — public action + read API
│   └── use-<thing>.ts
├── components/                  # Domain components (DS primitives + business logic)
│   └── <thing>/<thing>.tsx
├── utils/                       # Pure helpers (label resolvers, validators, toasts)
│   └── <thing>.ts
└── index.ts                     # Public barrel. Single source of cross-feature truth.
```

Not every context needs every folder. A read-only context with no local
state omits `state/`. A context with no qfilter logic omits `builders/`.
A context with no user-driven workflows omits `hooks/` action hooks. But
the folders that exist must have these names.

User-action workflows are spelled as a hook in `hooks/use-<verb>-<noun>.ts`
(e.g. `use-create-filter.ts`, `use-load-filter-set.ts`) plus the matching
UI components in `components/`. The earlier `use-cases/` folder pattern
is no longer prescribed — use the hook + component split instead.

### What `index.ts` exposes

- Domain types from `model/*`
- Pure helpers from `model/*` and `definitions/*` that don't depend on
  Redux or React (e.g. `computeDates`, enum-like constants)
- Public hooks from `hooks/*`
- Public components from `components/*`

### What `index.ts` MUST NOT expose

- Anything from `api/` (DTOs, raw query hooks, transforms)
- Anything from `state/` (slices, selectors, action creators) — expose
  through hooks only
- Internal helpers, columns files, internal sub-components

Cross-feature consumers import only `@/features/<context>`. Anything deeper
is private. Within the same feature, prefer relative imports
(`./api/foo.api`) over alias imports — this keeps internal traffic visibly
distinct from public API consumption.

---

## 3. The Anti-Corruption Layer

The single most important rule: the server's vocabulary stops at `api/`. The
domain model uses **domain language**, not HTTP language.

```
HTTP response (snake_case, server idioms)
     │
     ▼ transformResponse
DTO (api/*.dto.ts — internal Zod schema mirroring the wire)
     │
     ▼ toX(dto): X (api/*.transforms.ts)
Domain model (model/*.ts — camelCase, value objects, sum types)
     │
     ▼ via hooks
Components, selectors, tests
```

Outbound flow is symmetric: domain → payload DTO → wire shape via
`toXPayload(model)`. `buildQueryParams` lives in the kernel and does the
domain-to-wire translation for query strings (e.g. `DateRange` →
`start_date` / `end_date`).

### Rules

- Components and hooks **never** import a `*.dto.ts`.
- Every list endpoint goes through `transformResponse` → domain shape. Even
  if the transform is a no-op today, the seam must exist for future schema
  changes.
- Domain types are camelCase. Server fields like `creation_date`, `pk`,
  `criticity`, `family_class`, `dest_ip`, `hostname_info`, `qfilter` are
  translated at the boundary. The domain language is decided in the
  bounded-context glossary, not by the route URL.
- Test the ACL with vitest only (no React). Round-trip a fixture:
  `domain → payload → server → response → domain` and assert equality.

### Discriminated unions at the boundary

When the server uses string flags or enums, prefer a sum type in the domain:

```ts
// DTO
type ThreatDto = { family_class: 'doc' | 'dopv'; ... };

// Domain
type Threat =
  | { kind: 'compromise'; id: number; severity: number; ... }
  | { kind: 'policyViolation'; id: number; severity: number; ... };
```

Components `switch` on `kind`; TypeScript narrows. Server flags do not
appear in components.

---

## 4. Layered architecture inside each context

Each layer has a different test cost. The design goal is that as much logic
as possible lives in the cheap layers.

| Layer | Depends on | Tested with | Re-render cost |
|---|---|---|---|
| Domain model (`model/`) | nothing — pure TS | vitest only | — |
| Pure logic (selectors, builders, calculators) | domain model | vitest only | — |
| State adapter (slice, repository) | domain + Redux | vitest only (mount store, dispatch, assert) | — |
| API / ACL (`api/`) | domain + RTK base | vitest + msw (no React) | — |
| Hooks (`hooks/`) | api + slice | RTL `renderHook` + msw | low |
| Domain components (`components/`) | hooks + design-system | RTL + msw | medium |
| Routes (`routes/`) | domain components + router | Playwright (codecept) | high |

### Rules

- Pure logic — qfilter builders, killchain math, severity color mapping,
  threat-status reduction, IP/CIDR utilities — lives in `model/` or
  `common/lib/`. **Not** inside hooks, **not** inside columns files.
- Slice tests are pure reducer tests. Mount a real store, dispatch actions,
  read state. No mocking.
- API tests use msw against the real RTK Query base. No mocking the slice
  reducer.
- The proportion of vitest-only tests vs RTL tests should be high. If you
  find yourself reaching for `renderHook` or `render` to test what is
  fundamentally a pure function, the function is in the wrong place.

---

## 5. State placement decision tree

This is the rule that lets state location swap without rewriting features.

```
Is the state…

  ┌─ shareable via link / refresh-survivable / SEO?
  │  └─ URL (TanStack Router validateSearch)         e.g. page, page_size, group_by_flow
  │
  ├─ used by exactly one component or one tab?
  │  └─ React local state (useState)                   e.g. open accordion, hovered row
  │
  ├─ shared between siblings under the same route?
  │  └─ Lift to nearest common parent (still local)
  │
  ├─ used across routes / persists across navigations?
  │  └─ Redux slice (in feature/state/)                e.g. ongoing investigation, prefs
  │
  └─ derived from server data?
     └─ Don't store it — select from RTK Query cache
```

### The rule that makes swapping cheap

Feature components do not call `useNavigate`, `useSearch`, `useSelector`, or
`useState` for "their" state. They take **values + change handlers via
props**.

```tsx
// Feature component — router-agnostic
type Props = {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};
function ThreatsTable(props: Props) { … }

// Route — owns URL state, wires it up
function ThreatsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <Page>
      <ThreatsTable
        page={search.page}
        pageSize={search.page_size}
        onPageChange={(p) => navigate({ search: (s) => ({ ...s, page: p }) })}
        onPageSizeChange={(s) => navigate({ search: (q) => ({ ...q, page_size: s, page: 1 }) })}
      />
    </Page>
  );
}
```

If tomorrow we want this state in Redux instead of URL, only the route
changes. The component is unchanged.

`routes/network-events.tsx` is the canonical example. Match it.

---

## 6. Composition (route-as-orchestrator)

Three component roles, three component types.

| Role | Lives in | Knows about | Example |
|---|---|---|---|
| Design-system primitive | `common/design-system/atoms\|molecules\|entities/` | style, layout, a11y; **zero domain** | `<Page>`, `<Card>`, `<DataTable>`, `<Modal>` |
| Domain component | `features/<ctx>/components/` | one slice of business logic + domain types | `<ThreatTag threat={t} />`, `<HostsTable hosts={hs} onSelect={…} />` |
| Orchestrator | `routes/<page>.tsx` | URL state, layout, which feature components compose | `<Page><Card><ThreatsTable …/></Card><Drawer><HostInsightsView …/></Drawer></Page>` |

### Rules

- Atomic-design taxonomy (`atoms/`, `molecules/`, `entities/`) is reserved
  for `common/design-system`. Features use `components/` flatly.
- Domain components do not open modals, dispatch global actions, or read
  URL state. They render and emit handlers.
- Routes are thin: a Zod search schema, a layout (`<Page>` etc.), and
  `<FeatureComponent {...search} on…={…} />` calls. No `useEffect` business
  logic, no data fetching, no state derivation.
- Modals open from routes (or use-cases), not from inside domain components.
  A row's "Suppress" button calls a handler the route provided.

---

## 7. Naming

| Concern | Rule | Example |
|---|---|---|
| Files & folders | kebab-case, always | `hosts-table.tsx`, never `hostsTable.tsx` |
| Suffix for table | `<thing>-table.tsx` | `threats-table.tsx`, `hosts-table.tsx` |
| Suffix for column defs | `<thing>.columns.tsx` | `events.columns.tsx` |
| Domain types file | singular for entities | `model/threat.ts` (not `threats.ts`) |
| API file | plural | `api/threats.api.ts` |
| DTO file | singular, paired with model | `api/threat.dto.ts` |
| `.model.ts` | retired — use `model/<thing>.ts` | `model/threat.ts` |
| `.schema.ts` | only inside `api/` for DTOs | `api/threat.dto.ts` |
| Atoms/molecules/entities | only in `common/design-system` | features use flat `components/` |
| `index.ts` | mandatory, one per feature root | re-exports public API |

Linting enforces kebab-case (`unicorn/filename-case`, see
`.oxlintrc.json`). TanStack Router `$param.tsx` files are exempted.

---

## 8. Cross-context coupling

| Pattern | When | How |
|---|---|---|
| **Anti-Corruption Layer** | every HTTP boundary | `api/*.transforms.ts` |
| **Shared Kernel** | query-filters, filter-sets, tenancy, design-system | Lives in `common/` or owns its own context (`features/query-filters`, `features/filter-sets`); imported by everyone |
| **Customer/Supplier** | one context publishes a type, others consume | Producer's `index.ts` exports the type; consumer imports from `@/features/<producer>` |
| **Open Host Service** | design-system for UI shell | `common/design-system/*` exposes generic primitives with no domain knowledge |

### Rules

- A context never imports another context's `api/`, `state/`, or internal
  components. If you need it, the producer publishes it through its
  `index.ts`. If the producer does not want to publish it, find another
  way — that is the signal.
- The kernel (`common/`) does not depend on a feature. The wire-shape
  flags (`alert`, `stamus`, `discovery`) on `QFilter` are inlined in
  `common/fetching/fetching.types.ts` — they describe query params, not
  the query-filters feature's UI state.
- Cross-context types that are genuinely shared (e.g. `Tenant`,
  `DateRange`) live in the kernel, not in either feature.

---

## 9. Linting

Conventions are enforced by `.oxlintrc.json` where the linter supports
them. Two relevant rules in this phase:

- **`unicorn/filename-case`** — enforces kebab-case file names. Currently
  set to `warn`; existing violations are tracked and fixed during their
  context's migration. New code that introduces non-kebab names should be
  rejected at review.

- **`no-restricted-imports`** — forbids cross-feature deep imports targeting
  `api/` and `state/` folders. As features migrate this enforces public-API
  discipline on real code.

  Several framework-level patterns override the rule, since the public
  barrel can't carry their needs:
  - **Store wiring** (`src/store/store.ts`, `src/store/store.init.ts`):
    registering a slice with the root reducer needs the slice import.
  - **Slices and stores** (`**/*.slice.ts`, `**/*.store.ts`): RTK Query
    `extraReducers` listen to other features' endpoints (e.g. tenancy
    listens to `getGlobalSettings`); the listener pattern is by design
    cross-feature.
  - **Selectors** (`**/*.selectors.ts`): `createSelector` composition
    across features (e.g. query-filter selectors reading
    `selectIsEnterprise` from settings) is a valid pattern that the
    hook-only public API cannot express.
  - **Imperative dispatchers** (`**/*.filter-service.ts`): services
    that run outside React and dispatch via `store.dispatch()` (e.g.
    `NetworkTreeFilterService`) need direct slice action access
    because hooks aren't usable in imperative contexts. Convert to a
    hook when the only callers are React components.
  - **Route guards** (`src/routes/_enterprise.tsx`): TanStack Router's
    `beforeLoad` runs synchronously outside React, so it needs direct
    selector access rather than a hook.

oxlint does not implement `import/no-internal-modules`. We use
`no-restricted-imports` with glob patterns instead. If we later need a rule
oxlint does not have, oxlint can load ESLint plugins via its `jsPlugins`
field — but we have not needed this so far.

oxlint rule docs: <https://oxc.rs/docs/guide/usage/linter/rules.html>

---

## 10. Migration phases

Phase 0 — this document, oxlint rules, no behavior change. (done)

Phase 1 — pilot one context (`threats`) end-to-end as the reference
implementation.

Phase 2 — kernel cleanup. Done: inverted the `EventTypeFlags`
dependency (kernel `QFilter` no longer imports from any feature).
Deferred to Phase 3 (see "Deferred kernel cleanup" below): collapsing the
duplicate `Pagination` shape and introducing the `DateRange` value
object.

Phase 3 — migrate contexts in dependency order: identity & tenancy →
dates → query-filters → filter-sets → events → threats →
hosts/detection-methods/beaconing/filter-actions → remaining. Done
to date: tenancy, auth, settings, dates, query-filters (extracted
from the legacy `features/filtering/`), filter-sets (extracted from
the legacy `features/filtering/filtersets/` with full `alerts`↔`alert`
ACL), events (with beaconing folded in as a sub-component of the
events context), threats (full ACL with `kind`-discriminated
compromise/policy-violation domain), and filter-actions (full ACL
with `kind`-discriminated domain, single consolidated modal slice
under `state/`, and a route orchestrator). Remaining: detection-methods,
host-insights, and the peripheral contexts (deeplinks, hunting-trail,
investigation, marketing, operational-center, ui). As each context
migrates, its API surface adopts the domain-shaped `Pagination`
(`{ page, pageSize, ordering }`) and `DateRange` (`{ from, to }`);
`buildQueryParams` translates to wire at the boundary. The
kernel-wide collapse falls out of these per-feature migrations.

### Deferred kernel cleanup

Two kernel-level smells are intentionally **not** fixed in a single
sweeping refactor:

- **Duplicate `Pagination` shape.** `common/fetching/fetching.types.ts`
  exposes both `{ page, page_size }` (wire) and `{ pageIndex, pageSize }`
  (UI-table) keys on the same type. 91 files reference these names; many
  use literal `page_size: 1000` to bypass pagination. A single big-bang
  rewrite would touch every feature and is high-risk for features whose
  test coverage is thin. Instead, each feature migrates its API surface
  to the domain shape during its Phase 3 migration; the kernel type
  stays permissive in the interim.

- **`Dates` as `{ start_date?: number; end_date?: number }` (epoch
  millis).** 78 files reference these names. The target is a
  `DateRange = { from: Date; to: Date }` value object, with the kernel
  `buildQueryParams` translating to `start_date` / `end_date` (or
  `from_date` / `to_date` for elastic) at the wire. Same blast-radius
  argument as `Pagination`: migrated per feature in Phase 3.

Phase 4 — composition cleanup: thin routes, consolidate modal slices,
extract pure logic from React.

Phase 5 — tighten lint rules from `warn` to `error`, add CI checks for
mandatory `index.ts` per feature.

---

## 11. Conventions considered and rejected

- **Full tactical DDD (aggregates, repositories, domain-event bus).** The
  client does not own the write model; the backend does. Aggregates and a
  domain-event bus would be ceremony for ceremony's sake.
- **Feature-Sliced Design (FSD) layer labels** (`shared/entities/features/widgets/pages`).
  The structure is broadly compatible with FSD but the labels (especially
  "widgets") do not match Scout's domain language. We borrow the
  layering idea, not the vocabulary.
- **Nx monorepo with library boundaries.** Physical enforcement of barriers
  is appealing but the tooling cost is large and Scout does not have the
  multi-team scale that justifies it. Revisit if the team grows past three
  parallel streams of work.
- **`@kernel/*` import alias** as a rename of `@/common/*`. Pure cosmetic;
  rejected — `@/common` already conveys "kernel" and the rename would touch
  every file for no behavioral gain.
