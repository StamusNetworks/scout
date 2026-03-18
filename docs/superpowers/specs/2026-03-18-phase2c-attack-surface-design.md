# Phase 2c: Attack Surface Design

## Overview

Migrate attack surface pages to thin orchestrators using host-insights entities. Create InventoryTable and NetworkTreeSunburst entities.

## Feature Structure

No dedicated attack-surface feature — it composes from host-insights:

```
features/host-insights/use-cases/
├── hosts-list/
│   └── entities/
│       ├── hosts-table.tsx              # Existing (Phase 2a)
│       └── hosts-inventory-table.tsx    # New — attack surface inventory
│
└── hosts-visualisation/
    └── entities/
        └── network-tree-sunburst.tsx    # New — attack surface sunburst
```

## Entities

### HostsInventoryTable

Typed props:
```ts
interface HostsInventoryTableProps {
  page: number;
  pageSize: number;
  sorting: SortingState;
  inHomeNet: 'true' | 'false' | 'all';
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
  onRowClick: (hostId: string) => void;
}
```

Fetches hosts via `useGetHostsQuery` (no alerts mode). Uses hosts-list columns. Renders Table + PaginationFooter.

### NetworkTreeSunburst

Self-contained entity:
```ts
interface NetworkTreeSunburstProps {
  inHomeNet: 'true' | 'false' | 'all';
}
```

Fetches network tree data via `useGetNetworkTreeQuery`. Manages count type selection internally. Renders interactive sunburst chart. Handles Redux filter dispatching on node click.

## Route Migrations

### `/attack-surface/route.tsx` — Tab Layout

Renders Page/PageHeader + DiscoveredHosts + HomeNetPicker + Tabs (Visualisation/Inventory) + Outlet. The `in_home_net` search param lives here and flows to child routes.

### `/attack-surface/` (index) — Thin Orchestrator

Passes `inHomeNet` from parent search params to `NetworkTreeSunburst`.

### `/attack-surface/inventory` — Thin Orchestrator

Zod schema: `{ page, page_size, sort, in_home_net }`. Passes typed props to `HostsInventoryTable`.

## Pages Deleted

- `src/pages/attack-surface/index.tsx`
- `src/pages/attack-surface/visualisation/index.tsx`
- `src/pages/attack-surface/inventory/index.tsx`
