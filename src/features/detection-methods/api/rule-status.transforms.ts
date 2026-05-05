import { toPairs, values } from 'ramda';

import { RuleStatus } from '../model/rule-status';
import { RuleStatusResponseDto } from './rule-status.dto';

export const toRuleStatuses = (response: RuleStatusResponseDto): RuleStatus[] =>
  toPairs(response).map(
    ([rulesetIdStr, { name, valid, transformations, ...rulePkEntries }]) => ({
      rulesetId: Number(rulesetIdStr),
      name,
      valid,
      transformations,
      isActive: values(rulePkEntries).some((entry) => entry.active),
    }),
  );
