// model / domain types (slice-defined)
export type {
  InvestigationStage,
  InvestigationStagePayload,
  InvestigationState,
  InvestigationStageState,
  InvestigationValueState,
} from './state/investigation.slice';
export type {
  InvestigationHistory,
  InvestigationHistoryState,
  InvestigationTag,
} from './state/investigations-history.slice';

// hooks (cross-feature read/write surface)
export {
  useAddEvidence,
  useAddFindingsKey,
  useCurrentInvestigationStage,
  useInvestigationFilter,
  useInvestigationStage,
  useIsActiveFindings,
  useStartInvestigation,
} from './hooks/use-investigation';

// components
export { Investigation } from './components/ongoing-investigation/ongoing-investigation';
export { InvestigationHistoryList } from './components/investigations-view/investigations-view';
