import { RuleSet } from '../model/rule-set';
import { RuleSetDto } from './rule-set.dto';

export const toRuleSet = (dto: RuleSetDto): RuleSet => ({
  id: dto.pk,
  name: dto.name,
  description: dto.descr,
  createdAt: dto.created_date,
  updatedAt: dto.updated_date,
  needTest: dto.need_test,
  isValid: dto.validity,
  errors: dto.errors,
  rulesCount: dto.rules_count,
  sources: dto.sources,
  categories: dto.categories,
  warnings: dto.warnings,
  warningsSendMail: dto.warnings_send_mail,
});
