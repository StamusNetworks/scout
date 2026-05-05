import { phaseFromStep } from '@/features/threats';

import {
  Rule,
  RuleCategory,
  RuleMethod,
  RuleThreatInfo,
  RuleVersion,
} from '../model/rule';
import { RuleDto, RuleVersionDto } from './rule.dto';

export const toRuleVersion = (dto: RuleVersionDto): RuleVersion => ({
  id: dto.id,
  analysis: dto.analysis,
  contentHtml: dto.content_html,
  rev: dto.rev,
  version: dto.version,
  content: dto.content,
  state: dto.state,
  isCommentedInSource: dto.commented_in_source,
  importedAt: dto.imported_date,
  importedAtMeta: dto.updated_date,
  createdAt: dto.created,
  updatedAt: dto.updated,
});

const toCategory = (dto: RuleDto['category']): RuleCategory => ({
  id: dto.pk,
  name: dto.name,
  description: dto.descr,
  createdAt: dto.created_date,
  source: dto.source,
});

const toThreatInfo = (dto: RuleDto['threat_info']): RuleThreatInfo => ({
  family: dto.family,
  name: dto.name,
  description: dto.description,
  source: dto.source,
  createdAt: dto.created,
  updatedAt: dto.updated,
});

const toMethod = (dto: NonNullable<RuleDto['method']>): RuleMethod => ({
  methodId: dto.method_id,
  threatId: dto.threat_id,
  targetKey: dto.target_key,
  sourceKey: dto.source_key,
  ...(dto.extra_info !== undefined ? { extraInfo: dto.extra_info } : {}),
  ...(dto.extra_info_name !== undefined
    ? { extraInfoName: dto.extra_info_name }
    : {}),
  description: dto.description,
  version: dto.version,
  isActive: dto.active,
  targetType: dto.target_type,
  offenderType: dto.offender_type,
  methodType: dto.method_type,
  killChainPhase: phaseFromStep(dto.kill_chain) ?? null,
  originalSid: dto.original_sid,
  oldContent: dto.old_content,
  originalContent: dto.original_content,
  threatContent: dto.threat_content,
  ...(dto.owner_id !== undefined ? { ownerId: dto.owner_id } : {}),
  trackOffender: dto.track_offender,
  trackTarget: dto.track_target,
  isUserDefined: dto.user_defined,
  ...(dto.action_id !== undefined ? { actionId: dto.action_id } : {}),
});

export const toRule = (dto: RuleDto): Rule => ({
  id: dto.pk,
  sid: dto.sid,
  category: toCategory(dto.category),
  msg: dto.msg,
  createdAt: dto.created,
  updatedAt: dto.updated,
  hits: dto.hits,
  versions: dto.versions.map(toRuleVersion),
  threatInfo: toThreatInfo(dto.threat_info),
  ...(dto.method !== undefined ? { method: toMethod(dto.method) } : {}),
  timelineData: dto.timeline_data,
});
