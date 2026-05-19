# Plan: Host Files Tab

**Created**: 2026-05-19
**Branch**: `naughty-chicken`
**Issue**: [`devel/dev/front-end/scout#103`](https://git.stamus-networks.com/devel/dev/front-end/scout/-/work_items/103)
**Spec source**: in-session `/specs` artifacts (Intent, Gherkin, Architecture, Acceptance)
**Status**: implemented

## Goal

Add a new **Files** tab to `/hosts/$hostId` that lists `event_type:fileinfo` events whose `src_ip` or `dest_ip` equals the host's IP, scoped to the active tenant and date range. Each fileinfo event is one row — multi-chunk transfers stay un-grouped, with a *Chunked* (Yes/No) column and an *Offset* column sourced from `http.content_range.start`. The tab is appended after Beacons and ships with a count badge mirroring the table query.

## Acceptance Criteria

Mirrored from the spec's Acceptance Criteria and Gherkin scenarios.

- [ ] AC1: `/hosts/<ip>/files` renders the Files tab content without 404 or layout regression.
- [ ] AC2: Files tab appears in the tab strip after Beacons and is highlighted when active.
- [ ] AC3: Network request: exactly one `GET /rules/es/events_tail/` per `(hostId, tenant, dates, page, pageSize, sort)` tuple, with `qfilter` matching `(src_ip:"<id>" OR dest_ip:"<id>") AND event_type:fileinfo`.
- [ ] AC4: Loading, empty, error, and populated states all render (per CLAUDE.md "Network Queries" rule).
- [ ] AC5: `Chunked` column = `"Yes"` iff `event.http?.content_range` is truthy, otherwise `"No"`.
- [ ] AC6: `Offset` column renders `event.http?.content_range?.raw` when present, otherwise renders nothing (empty cell). The cell is defensive against `content_range` being entirely absent, `raw` being absent, or any sub-field being absent.
- [ ] AC7: Multi-chunk same-sha256 events render as separate rows (no client-side grouping).
- [ ] AC8: Tab badge mirrors `data.count` from a `pageSize: 1` query against the same qfilter.
- [ ] AC9: Pagination + sort persist via `page`/`page_size`/`sort` URL search params; tenant/date changes reset the page to 1.
- [ ] AC10: `http.content_range` schema is `z.object({ raw, start, end, size }).partial().optional()` and existing event mocks/fixtures still parse.
- [ ] AC11: `pnpm run fmt`, `pnpm run lint --fix`, `pnpm run check` all clean.
- [ ] AC12: New code covered by vitest/RTL; no regressions in `host-sightings-table.test.tsx`, `host-beacons-table.test.tsx`, or `route.test.tsx`.
- [ ] AC13: Public-barrel discipline preserved: `HostFilesTable` exported from `@/features/host-insights`, `HostFilesTabBadge` from `@/features/events`. No deep imports across feature boundaries.

## Steps

### Step 1: Type `http.content_range` in the http schema

**Complexity**: standard
**RED**: A unit test for `httpSchema` directly was attempted, but hits a pre-existing circular-import bug (`event.ts` ↔ app-proto schemas) that crashes when any schema file is loaded in isolation. The codebase works around this in production by only type-importing schemas at runtime. By user decision, verification falls back to:
- TypeScript (`pnpm run check`) — catches any consumer that misuses the new shape.
- The Step 2 component test asserts the column renders `event.http?.content_range?.raw` correctly, which exercises the typed field end-to-end.
**GREEN**: Replace `content_range: z.any().optional()` with:
```ts
content_range: z
  .object({
    raw: z.string().optional(),
    start: z.number().optional(),
    end: z.number().optional(),
    size: z.number().optional(),
  })
  .optional(),
```
Run `pnpm run check` to confirm no consumer breaks.
**REFACTOR**: None needed — single schema field.
**Files**: `src/features/events/model/app-proto/http.schema.ts`
**Commit**: `feat(events): type http.content_range with raw/start/end/size`

### Step 2: Implement `HostFilesTable` entity component

**Complexity**: standard
**RED**: In `src/features/host-insights/components/host-files-table/host-files-table.test.tsx` (new):
- Mock `GET /rules/es/events_tail/` via msw and assert that opening the table fires exactly one request whose `qfilter` query param contains both `src_ip:"192.168.1.5"` and `dest_ip:"192.168.1.5"` and `event_type:fileinfo`.
- Loaded: returns one chunked fileinfo event (`http.content_range: { raw: 'bytes 0-99/300', start: 0, end: 99, size: 300 }`) and one non-chunked → table shows 2 rows; chunked row's *Chunked* cell is `"Yes"` and *Offset* shows `"bytes 0-99/300"`; non-chunked row's *Chunked* cell is `"No"` and *Offset* is empty.
- Multi-chunk: 3 events with the same `sha256` and different `content_range.raw` values → 3 separate rows, each Offset showing its own `raw` string.
- Defensive: event with `http.content_range = {}` (no `raw`) renders `Chunked: "Yes"` and *Offset* empty (we only display `raw`).
- Empty: `count: 0` → renders the `DataTableEmpty` for `entity="files"`.
- Error: server returns 500 → table error path is reached (mirrors `host-sightings-table.test.tsx` patterns).
- Loading: msw delay → loading indicator visible before the data resolves.
**GREEN**: Create:
- `host-files-table.tsx` — entity component accepting `{ hostId, page, pageSize, sorting, onPageChange, onPageSizeChange, onSortingChange }`. Build `qfilter = `(src_ip:"${esEscape(hostId)}" OR dest_ip:"${esEscape(hostId)}") AND event_type:fileinfo``. Call `useGetEventsTailQuery` with `{ ...params, qfilter, pageIndex: page - 1, pageSize, ordering }`. Default sort `-timestamp`. Render `<Table data … columns={hostFilesTableColumns} …/>` + `<PaginationFooter/>` mirroring `HostSightingsTable`.
- `host-files-table.columns.tsx` — pure column defs: Timestamp (`<DateTime/>`), Filename (`<EventValue query_key="fileinfo.filename"/>`), SHA256 (`<EventValue query_key="fileinfo.sha256"/>`), Mimetype (`row.fileinfo?.mimetype ?? row.fileinfo?.type`), Size (`formatBytes`), Chunked (Yes/No derived from `Boolean(event.http?.content_range)`), Offset (`event.http?.content_range?.raw ?? ''` — display the raw string when present, nothing otherwise).
**REFACTOR**: Keep `HostFilesTable` symmetric with `HostSightingsTable` (same prop shape, same hooks, same imports order). If the chunked-derivation logic gets large, extract a tiny `isChunked(event)` helper in the same file — do *not* preemptively create a utils module.
**Files**: `src/features/host-insights/components/host-files-table/host-files-table.tsx` (new), `src/features/host-insights/components/host-files-table/host-files-table.columns.tsx` (new), `src/features/host-insights/components/host-files-table/host-files-table.test.tsx` (new), `src/features/host-insights/index.ts`
**Commit**: `feat(host-insights): add HostFilesTable for fileinfo events`

### Step 3: Implement `HostFilesTabBadge`

**Complexity**: standard
**RED**: In `src/features/events/components/host-tab-badges/host-tab-badges.test.tsx` (extend the existing pattern if a test file exists, otherwise create one) assert that `<HostFilesTabBadge hostId="192.168.1.5" />`:
- Fires a `GET /rules/es/events_tail/` with `pageSize: 1` and the same fileinfo qfilter as the table.
- Renders the count returned by the API (assert `screen.getByText('42')` on a stub that returns `count: 42`).
- Renders a loading state while the query is pending.
**GREEN**: In `src/features/events/components/host-tab-badges/host-tab-badges.tsx`, add `HostFilesTabBadge` mirroring `HostBeaconsTabBadge` but calling `useGetEventsTailQuery` with `qfilter = `(src_ip:"${escaped}" OR dest_ip:"${escaped}") AND event_type:fileinfo``. Export from `src/features/events/index.ts`.
**REFACTOR**: If the new badge duplicates more than the qfilter string vs. siblings, leave it — the existing badges in this file are intentionally repetitive. Do *not* introduce a generic builder.
**Files**: `src/features/events/components/host-tab-badges/host-tab-badges.tsx`, `src/features/events/components/host-tab-badges/host-tab-badges.test.tsx` (new or extended), `src/features/events/index.ts`
**Commit**: `feat(events): add HostFilesTabBadge`

### Step 4: Create the `/hosts/$hostId/files` route

**Complexity**: standard
**RED**: Deviation from plan — no per-route test added. None of the existing per-tab route files (`sightings.tsx`, `beacons.tsx`, `outlier-events.tsx`, etc.) have a colocated test; they are trivial delegators that pass URL state into their feature component, and the URL→prop wiring is already covered by `usePaginatedSearch` and the component-level tests. Adding one only for `files.tsx` would be inconsistent. The route file is verified by `pnpm run check` (typecheck) and by manual smoke during the final quality gate.
**GREEN**: Create `src/routes/_enterprise/hosts/$hostId/files.tsx` as a near-copy of `sightings.tsx`:
- `createFileRoute('/_enterprise/hosts/$hostId/files')`
- `validateSearch` = zod schema with `page` (default 1), `page_size` (default 10), `sort` (default `''`).
- `component` wraps in `PageBoundary`, renders `HostFilesTab`.
- `HostFilesTab` uses `useParams`, `Route.useSearch`, `Route.useNavigate`, `useGlobalQueryParams(['tenant','dates'])`, `usePaginatedSearch({ search, navigate }, { resetOn: [globals.tenant, globals.from, globals.to] })`.
- Pass plain values + handlers into `<HostFilesTable/>`.
**REFACTOR**: None — copy-paste consistency with sightings.tsx is the convention.
**Files**: `src/routes/_enterprise/hosts/$hostId/files.tsx` (new), `src/routeTree.gen.ts` (regenerated)
**Commit**: `feat(routes): add /hosts/$hostId/files route`

### Step 5: Wire the Files tab into the host detail tab strip

**Complexity**: trivial
**RED**: Extend `src/routes/_enterprise/hosts/$hostId/route.test.tsx` with a single assertion: after rendering the layout for a valid host, the "Files" tab link is present in the DOM with `href="/hosts/<ip>/files"`. (The existing test scaffolding already mocks the necessary endpoints; add a stub for the new badge query.)
**GREEN**: In `src/routes/_enterprise/hosts/$hostId/route.tsx`:
- Import `HostFilesTabBadge` from `@/features/events`.
- Append a new `<TabsTrigger value="/hosts/${hostId}/files" asChild>` after the Beacons trigger, wrapping a `<Link to="/hosts/$hostId/files" params={{ hostId }}>Files <HostFilesTabBadge hostId={hostId}/></Link>`.
**REFACTOR**: None — strictly additive.
**Files**: `src/routes/_enterprise/hosts/$hostId/route.tsx`, `src/routes/_enterprise/hosts/$hostId/route.test.tsx`
**Commit**: `feat(host-insights): add Files tab to host detail layout`

## Complexity Classification

| Step | Rating | Why |
|---|---|---|
| 1. Type `http.content_range` | standard | Schema change ripples into types across the events feature |
| 2. `HostFilesTable` | standard | New component + columns + tests; reuses existing API |
| 3. `HostFilesTabBadge` | standard | New component + test; well-trodden pattern |
| 4. Files route | standard | New route + URL-state plumbing |
| 5. Tab strip wiring | trivial | Additive JSX, single import |

## Pre-PR Quality Gate

- [ ] All tests pass (`pnpm run check` includes `vitest run`)
- [ ] Type check passes (`pnpm run check`)
- [ ] Linter passes (`pnpm run lint`)
- [ ] Formatting clean (`pnpm run fmt`)
- [ ] `/code-review --changed` passes
- [ ] Manual smoke: open `/hosts/<known-ip>/files`, confirm loaded/empty/chunked rendering and badge count

## Risks & Open Questions

- **Wire shape of `http.content_range`** — assumed to be the Suricata-typical `{ raw, start, end, size }` object. If the backend on this deployment emits the raw header string only, step 1's schema rejects it. Mitigation: all sub-fields are `.optional()`, and the column accessor reads `?.start` defensively; if the field is ever a string we will adjust the schema with one of (a) accept `string` via `z.union`, or (b) extend the type later — both are non-breaking iterations.
- **Default sort** — set to `-timestamp` by analogy with sightings. If product wants size-desc as default, swap one default in step 4.
- **Tab placement** — appended after Beacons by explicit decision; revisit only if product feedback asks for it.
- **No download action in v1** — confirmed scope split; if `/rules/filestore/.../retrieve/` integration is wanted later, it slots onto the `HostFilesTable` row actions without API changes.
- **`http.content_range` presence on non-HTTP transfers** — SMB/FTP file transfers won't set the field, so they'll all render as `Chunked: No`. Spec accepts this: "chunked" is HTTP-Content-Range chunked, not "transfer fragmented at the L7 protocol level".
