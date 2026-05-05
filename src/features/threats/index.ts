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
export type { ThreatFamily } from './model/threat-family';
export type { ActiveThreat, ActiveThreatAssets } from './model/active-threat';
export type { ActiveThreatFamily } from './model/active-threat-family';
export type { ImpactedEntity, EntityThreat } from './model/impacted-entity';
export type { ThreatStatus } from './model/threat-status';
export type {
  KillChainPhase,
  KillChainPhaseConfig,
  KillChainCounters,
} from './model/kill-chain';
export {
  KILL_CHAIN_PHASES,
  KILL_CHAIN_PHASES_KEYS,
  KILL_CHAIN_PHASES_KEYS_WITHOUT_POLICIES,
  phaseFromStep,
  killChainOptions,
  killChainWithoutPoliciesOptions,
} from './model/kill-chain';

// Hooks
export { useThreatById } from './hooks/use-threat-by-id';
export { useThreatFamilyOverview } from './hooks/use-threat-family-overview';

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
export { ActiveFamiliesList } from './components/active-families-list/active-families-list';
export { ActiveThreatsList } from './components/active-threats-list/active-threats-list';
export { AttackFlow } from './components/attack-flow/attack-flow';
export { FamiliesList } from './components/families-list/families-list';
export { FamilyActiveThreats } from './components/family-active-threats/family-active-threats';
export { FamilyDetectionMethods } from './components/family-detection-methods/family-detection-methods';
export { FamilyEvents } from './components/family-events/family-events';
export { FamilyThreats } from './components/family-threats/family-threats';
export { HuntingTrail } from './components/hunting-trail/hunting-trail';
export { IncidentsTable } from './components/incidents-table/incidents-table';
export { ThreatActions } from './components/threat-actions/threat-actions';
export { ThreatDetailTabs } from './components/threat-detail-tabs/threat-detail-tabs';
export { ThreatDetectionMethods } from './components/threat-detection-methods/threat-detection-methods';
export { ThreatEntitiesOverview } from './components/threat-entities-overview/threat-entities-overview';
export { ThreatEvents } from './components/threat-events/threat-events';
export { ThreatFamilyHeader } from './components/threat-family-header/threat-family-header';
export { ThreatFamilyTabs } from './components/threat-family-tabs/threat-family-tabs';
export { ThreatForm } from './components/threat-form/threat-form';
export { ThreatGraph } from './components/threat-graph/threat-graph';
export { ThreatName } from './components/threat-name/threat-name';
export { ThreatsList } from './components/threats-list/threats-list';
export { Timeline } from './components/timeline/timeline';
export { HostTimelineTemplate } from './components/timeline/history-timeline';
