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
  KillChainCountersData,
} from './model/kill-chain';
export {
  KILL_CHAIN_PHASES,
  KILL_CHAIN_PHASES_KEYS,
  KILL_CHAIN_PHASES_KEYS_WITHOUT_POLICIES,
  phaseFromStep,
  killChainOptions,
  killChainWithoutPoliciesOptions,
  killChainPhaseSchema,
} from './model/kill-chain';

// Hooks
export { useThreatById } from './hooks/use-threat-by-id';
export { useThreatFamilyOverview } from './hooks/use-threat-family-overview';
export { useThreats } from './hooks/use-threats';
export { useThreat } from './hooks/use-threat';
export { useKillChainCounters } from './hooks/use-kill-chain-counters';
export { useThreatDetectionMethods } from './hooks/use-threat-detection-methods';
export { useThreatEvents } from './hooks/use-threat-events';

/**
 * RTK Query hook re-exports. Cross-feature consumers should prefer
 * the domain-level hooks above, but these are exposed here so that
 * deep `@/features/threats/api/*` imports stay banned by lint while
 * legacy callers remain functional.
 */
export {
  useGetThreatFamiliesQuery,
  useGetActiveThreatFamiliesQuery,
  useGetActiveThreatsQuery,
  useGetThreatByIdQuery,
  useGetSTIThreatsQuery,
  useGetCustomThreatsQuery,
  useGetThreatsStatusQuery,
  useGetWorldMapOffendersCountsQuery,
  useDeleteThreatMutation,
} from './api/threats.api';
export {
  useGetImpactedEntitiesQuery,
  useGetImpactedEntityQuery,
  useGetAttackerInfrastructureQuery,
  useGetKillChainCountersQuery,
  useGetKillChainCountersByThreatIdQuery,
  useUpdateEntityStatusMutation,
} from './api/entities.api';
export {
  useGetThreatHistoryQuery,
  useGetOffendersQuery,
} from './api/timeline.api';

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
export { EntityThreatTagsList } from './components/entities-threat-tags-list/entities-threat-tags-list';
export { EntityThreatTagsListTemplate } from './components/entities-threat-tags-list/entities-threat-tags-list';
export { FamiliesList } from './components/families-list/families-list';
export { FamilyActiveThreats } from './components/family-active-threats/family-active-threats';
// FamilyDetectionMethods, FamilyEvents, FamilyThreats are intentionally NOT
// re-exported here: they import from `@/features/events` and
// `@/features/rules` (which themselves transitively import from
// the threats barrel), creating a barrel-to-barrel cycle. Routes deep-import
// them directly via `@/features/threats/components/<name>/<name>`.
export { HuntingTrail } from './components/hunting-trail/hunting-trail';
export { ImpactedEntitiesTable } from './components/impacted-entities-table/impacted-entities-table';
export { IncidentsTable } from './components/incidents-table/incidents-table';
export { IpOrEntityEventValue } from './components/ip-or-entity/ip-or-entity';
export {
  KillChainCounters,
  KillChainCountersByFamilyId,
  KillChainCountersByThreatId,
} from './components/kill-chain-counters/kill-chain-counters';
export { KillchainTag } from './components/kill-chain-tag/kill-chain-tag';
export { OffendersWorldMap } from './components/offenders-world-map/offenders-world-map';
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
export { threatStatusColumnDefs } from './components/threat-status-columns/threat-status-columns';
export { ThreatTag } from './components/threat-tag/threat-tag';
export { Timeline } from './components/timeline/timeline';
export { HostTimelineTemplate } from './components/timeline/history-timeline';
