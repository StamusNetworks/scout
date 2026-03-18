# Phase 3a: Threats Feature Structure + Compromises Design

## Overview

Create `features/threats/` domain, move threats/entities code, and migrate the compromises section routes (incidents, entities, graph, attack-flow) plus the threats layout route and timeline.

## Feature Structure

```
features/threats/
├── common/
│   ├── threats.model.ts                    # Threat, ThreatFamily, ActiveThreat, ThreatStatus types
│   ├── threats.api.ts                      # Threats API endpoints
│   ├── entities.api.ts                     # Impacted entities API
│   ├── entities.model.ts                   # Entity, ImpactedEntity types
│   ├── molecules/
│   │   ├── impacted-entities-table.tsx     # Shared table (accepts familyClass prop)
│   │   ├── entities-force-graph.tsx        # Shared graph (accepts familyClass prop)
│   │   ├── threat-tag.tsx
│   │   ├── kill-chain-tag.tsx
│   │   ├── coverage-block.tsx
│   │   └── indicators.tsx                  # IndicatorsDoc + IndicatorsDopv
│   └── hooks/
│       ├── use-threats.ts
│       ├── use-impacted-entities.ts
│       └── use-kill-chain-counters.ts
│
├── compromises/                            # family_class: 'doc'
│   └── use-cases/
│       ├── incidents/
│       │   ├── incidents.table.tsx
│       │   └── entities/
│       │       └── incidents-table.tsx     # Typed props entity
│       ├── entities/
│       │   └── entities/
│       │       └── compromises-entities.tsx # Self-contained (familyClass='doc')
│       ├── graph/
│       │   └── entities/
│       │       └── compromises-graph.tsx   # Self-contained (familyClass='doc')
│       ├── attack-flow/
│       │   └── entities/
│       │       └── attack-flow-view.tsx    # Self-contained Sankey
│       └── timeline/
│           └── entities/
│               └── threats-timeline-view.tsx
│
├── policy-violations/                      # Phase 3c
├── coverage/                               # Phase 3b
```

## Code Movement

**Move from `features/hunt/threats/` to `features/threats/common/`:**
- `api/threats.api.ts` → `common/threats.api.ts`
- `model/*` → `common/threats.model.ts`
- `components/threat-tag.tsx` → `common/molecules/`
- `components/coverage-block/` → `common/molecules/`
- `hooks/*` → `common/hooks/`

**Move from `features/hunt/entities/` to `features/threats/common/`:**
- `api/entities.api.ts` → `common/entities.api.ts`
- `model/*` → `common/entities.model.ts`
- `components/impacted-entities-table/` → `common/molecules/`
- `components/entities-force-graph/` → `common/molecules/`
- `hooks/*` → `common/hooks/`

**Make old locations re-export** for backward compatibility.

## Entities

### IncidentsTable (typed props)
```ts
interface IncidentsTableProps {
  page: number;
  pageSize: number;
  sorting: SortingState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
}
```
Fetches `useGetThreatsStatusQuery`. Kill chain filter internal. Empty state with entity count + navigation links.

### CompromisesEntities (self-contained)
Props: none. Renders `KillChainCounters` + `ImpactedEntitiesTable` with `familyClass='doc'`.

### CompromisesGraph (self-contained)
Props: none. Renders `EntitiesForceGraph` with `familyClass='doc'`.

### AttackFlowView (self-contained)
Props: none. Sankey chart with threat-specific columns. Context menu for filtering.

### ThreatsTimelineView (self-contained)
Props: none. Renders `ThreatsTimeline` component.

## Route Migrations

### `/threats/route.tsx` — Tab Layout
Page/PageHeader with title. IndicatorsDoc stats. Tabs: Incidents, Entities, Timeline, Graph, Coverage, Attack Flow. Outlet.

### `/threats/compromises/route.tsx` — Sub-layout (if needed) or redirect

### Tab routes — Thin orchestrators
- `/threats/compromises/incidents` → IncidentsTable (typed props)
- `/threats/compromises/entities` → CompromisesEntities
- `/threats/compromises/graph` → CompromisesGraph
- `/threats/compromises/attack-flow` → AttackFlowView
- `/threats/timeline` → ThreatsTimelineView

## Pages Deleted
- `src/pages/threats/index.tsx`
- `src/pages/threats/compromises/index.tsx`
- `src/pages/threats/incidents/index.tsx` + test
- `src/pages/threats/impacted-entities/index.tsx`
- `src/pages/threats/graph/index.tsx`
- `src/pages/threats/attack-flow/index.tsx`
- `src/pages/threats/timeline/index.tsx`
