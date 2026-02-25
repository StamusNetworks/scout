## Context

The Volumetry page currently renders 5 overlaid series on a single chart (Network Events, Alerts, Sightings, Compromises, Policy Violations). This applies to both the main timeline and each per-probe timeline. As we add more data dimensions, the charts become cluttered and hard to read.

## Proposed Changes

### 1. Global series visibility controls

Add a page-level checkbox bar that controls which series are visible across **all** charts on the page (main timeline + every per-probe timeline). This avoids per-chart toggle clutter and ensures a consistent view.

Checkbox state should be persisted in URL query params so it survives page refreshes and can be shared.

### 2. New data series

Add two new data points to the available series:
- **Compromise** - Declarations of Compromise
- **Policy Violations** - Declarations of Policy Violation
- **Sightings** - New things observed on the network
- **Flows** — Useful for comparing trends against Network Events (e.g., 1 SMB flow generating many password-scanning events shows as 1 unique flow vs N network events).
- **Outlier Events** — Flags abnormal events detected via machine learning. Distinct from sightings/discovery.

### 3. Reclassify existing "Events" breakdown

The current series already split events well, but the naming and grouping should be clarified for the user:

| Series | Filter | Notes |
|--------|--------|-------|
| Network Events | `flow_id:* AND NOT event_type:(alert OR stamus OR discovery)` | Protocol transactions. Can be noisy (e.g., SMB password scanning) |
| Flows | `event_type:flow` | Useful trend comparison vs Network Events |
| Alerts | `event_type:alert` | Suricata rule matches. Can be noisy, irrelevant, or important |
| Compromises (DoC) | `event_type:stamus AND NOT kill_chain:pre_condition` | Declarations of Compromise |
| Policy Violations (DoPV) | `event_type:stamus AND kill_chain:pre_condition` | Declarations of Policy Violation |
| Sightings | `event_type:discovery` | New things observed on the network |
| Outlier Events | `stamus_novel:true` | ML-detected abnormal events |

### 4. Curated defaults

Not all series should be visible by default to avoid initial clutter. Suggested defaults (to be refined during implementation):

- **On by default:** Network Events, Outlier Events, Compromises
- **Off by default:** Flows, Policy Violations, Sightings, Alerts

## Technical Notes

- The `EventsTimeline` component already fires one `useGetEventsTimelineQuery` call per series — adding new series follows the same pattern. Another issue will tackle data source optimization
- Global toggle state should live in URL query params (via `nuqs`) so all `EventsTimeline` instances on the page read from the same source.