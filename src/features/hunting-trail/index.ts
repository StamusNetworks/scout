// model
export type {
  PurposeGroupData,
  PurposeSlug,
  TaggedEvent,
  TimelineEventType,
  TimelineGroup,
  TypeColorConfig,
} from './model/hunting-trail';
export {
  HUNTING_TRAIL_DOCS_URL,
  PURPOSE_GROUPS,
  PURPOSE_SLUG_MAP,
  PURPOSE_SLUGS,
  TIMELINE_TYPE_PRIORITY,
  TYPE_COLOR,
  TYPE_LABEL,
} from './model/hunting-trail';
export { computeRunStats } from './model/run-stats';
export type { RunStats } from './model/run-stats';

// hooks
export { useHostHuntingTrail } from './hooks/use-host-hunting-trail';
export { useNetworkHuntingTrail } from './hooks/use-network-hunting-trail';

// components
export {
  NetworkHuntingTrailProvider,
  useNetworkHuntingTrailContext,
} from './components/network-hunting-trail-context/network-hunting-trail-context';
export { PurposeAggregated } from './components/purpose-aggregated/purpose-aggregated';
export { PurposeTabContent } from './components/purpose-tab-content/purpose-tab-content';
export { RunBanner } from './components/run-banner/run-banner';
export { SummaryMatrix } from './components/summary-matrix/summary-matrix';
export {
  buildAssetMatrix,
  filterGroupsByAsset,
} from './components/summary-matrix/summary-matrix.aggregate';
export type {
  AssetCell,
  AssetRow,
} from './components/summary-matrix/summary-matrix.aggregate';
