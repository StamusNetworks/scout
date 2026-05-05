/**
 * Public API for the threats bounded context.
 *
 * Cross-feature consumers must import from this barrel only. Anything not
 * re-exported here is internal — see `docs/architecture.md`.
 */

// Domain types
export type {
  Threat,
  ThreatKind,
  ThreatTenantScope,
  ThreatLink,
  ThreatPayload,
} from './model/threat';
export { KIND_LABEL } from './model/threat';

// Hooks
export { useThreatById } from './hooks/use-threat-by-id';

/**
 * Cross-feature consumer (host-insights) of threat history. Exposed as
 * a migration helper; will be wrapped in a domain hook later.
 */
export { useGetThreatHistoryQuery } from './api/timeline.api';

/**
 * Migration helper. Cross-feature consumers that still read DTO-shaped
 * threats from legacy list queries (e.g. `useGetCustomThreatsQuery`) can
 * use this to convert one to a domain `Threat`. To be removed once the
 * list endpoints also return domain shape.
 */
export { toThreat } from './api/threat.transforms';

// Components
export { AttackFlow } from './components/attack-flow/attack-flow';
export { HuntingTrail } from './components/hunting-trail/hunting-trail';
export { IncidentsTable } from './components/incidents-table/incidents-table';
export { ThreatActions } from './components/threat-actions/threat-actions';
export { ThreatDetailTabs } from './components/threat-detail-tabs/threat-detail-tabs';
export { ThreatDetectionMethods } from './components/threat-detection-methods/threat-detection-methods';
export { ThreatEntitiesOverview } from './components/threat-entities-overview/threat-entities-overview';
export { ThreatEvents } from './components/threat-events/threat-events';
export { ThreatForm } from './components/threat-form/threat-form';
export { ThreatGraph } from './components/threat-graph/threat-graph';
export { ThreatName } from './components/threat-name/threat-name';
export { Timeline } from './components/timeline/timeline';
export { HostTimelineTemplate } from './components/timeline/history-timeline';
