// Domain types
export type {
  Rule,
  RuleCategory,
  RuleMethod,
  RuleThreatInfo,
  RuleVersion,
} from './model/rule';
export type { RuleSet } from './model/rule-set';
export type {
  RuleStatus,
  RuleStatusTransformations,
  RuleStatusValidity,
} from './model/rule-status';
export type { Analysis, Engine, Match } from './model/analysis';

/**
 * RTK Query hook re-exports. Cross-feature consumers should prefer
 * domain-level hooks once we have them; for now these are exposed
 * so deep `@/features/rules/api/*` imports stay banned
 * by lint.
 */
export {
  useGetRuleBySidQuery,
  useGetRuleSetsQuery,
  useGetRuleStatusesByRuleIdQuery,
  useGetRulesQuery,
  useUpdatePushRuleSetMutation,
} from './api/rules.api';

// Public components
export { HostDetectionMethodsTabBadge } from './components/host-detection-methods-tab-badge/host-detection-methods-tab-badge';
export { RuleAnalysis } from './components/rule-analysis';
export { RuleFlow } from './components/rule-flow/rule-flow';
export { RuleRulesetStatus } from './components/rule-ruleset-status/rule-ruleset-status';
export { RuleTimeline } from './components/rule-timeline/rule-timeline';
export {
  rulesTableColumns,
  rulesTableExportColumns,
} from './components/rules-table/rules-table.columns';
export {
  RuleExpandedRow,
  RuleExpandedRowTemplate,
} from './components/rules-table/rules-table.expanded-row';
export { RulesTable } from './components/rules-table/rules-table';
export { UpdatePushRuleSet } from './components/update-push-rule-set';
