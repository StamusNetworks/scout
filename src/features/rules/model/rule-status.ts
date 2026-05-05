export type RuleStatusValidity = {
  status: boolean;
  info: string[];
  warnings: string[];
  errors: string[];
};

export type RuleStatusTransformations = {
  action: string | null;
  lateral: string;
  target: string;
};

/**
 * The participation status of one rule in a single ruleset.
 * Returned per-ruleset for a given rule id.
 */
export type RuleStatus = {
  rulesetId: number;
  name: string;
  valid: RuleStatusValidity;
  transformations: RuleStatusTransformations;
  isActive: boolean;
};
