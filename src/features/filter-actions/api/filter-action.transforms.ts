import {
  FilterAction,
  FilterActionKind,
  FilterActionPayload,
  FilterActionStats,
  FilterDef,
} from '../model/filter-action';
import {
  FilterActionActionDto,
  FilterActionDto,
  FilterActionPayloadDto,
  FilterActionStatsDto,
  FilterDefDto,
} from './filter-action.dto';

const KIND_BY_ACTION: Record<FilterActionActionDto, FilterActionKind> = {
  threshold: 'threshold',
  suppress: 'suppress',
  tag: 'tag',
  tagkeep: 'tagAndKeep',
  threat: 'threat',
  send_mail: 'sendMail',
};

const ACTION_BY_KIND: Record<FilterActionKind, FilterActionActionDto> = {
  threshold: 'threshold',
  suppress: 'suppress',
  tag: 'tag',
  tagAndKeep: 'tagkeep',
  threat: 'threat',
  sendMail: 'send_mail',
};

export const toFilterActionKind = (
  action: FilterActionActionDto,
): FilterActionKind => KIND_BY_ACTION[action];

export const toFilterActionActionDto = (
  kind: FilterActionKind,
): FilterActionActionDto => ACTION_BY_KIND[kind];

const FORCE_WILDCARD_KEYS = new Set(['content', 'msg']);

export const toFilterDef = (dto: FilterDefDto): FilterDef => ({
  key: dto.key,
  value: dto.value,
  isNegated: dto.operator === 'different',
  isWildcarded: !dto.full_string,
  ...(dto.msg !== undefined ? { msg: dto.msg } : {}),
});

export const toFilterDefDto = (def: FilterDef): FilterDefDto => ({
  key: def.key,
  value: def.value,
  operator: def.isNegated ? 'different' : 'equal',
  full_string: FORCE_WILDCARD_KEYS.has(def.key) ? false : !def.isWildcarded,
  ...(def.msg !== undefined ? { msg: def.msg } : {}),
});

export const toFilterAction = (dto: FilterActionDto): FilterAction => {
  const base = {
    id: dto.pk,
    eventType: dto.event_type,
    filterDefs: dto.filter_defs.map(toFilterDef),
    rulesets: dto.rulesets,
    index: dto.index,
    description: dto.description,
    enabled: dto.enabled,
    imported: dto.imported,
    comment: dto.comment,
    username: dto.username,
    createdAt: dto.creation_date,
  };
  switch (dto.action) {
    case 'threshold':
      return { ...base, kind: 'threshold', options: dto.options };
    case 'suppress':
      return { ...base, kind: 'suppress' };
    case 'tag':
      return { ...base, kind: 'tag', options: dto.options };
    case 'tagkeep':
      return { ...base, kind: 'tagAndKeep', options: dto.options };
    case 'threat':
      return {
        ...base,
        kind: 'threat',
        options: {
          threat: dto.options.threat,
          killChain: dto.options.kill_chain,
          sourceKey: dto.options.source_key,
          targetKey: dto.options.target_key,
          trackOffender: dto.options.track_offender,
          trackTarget: dto.options.track_target,
          targetType: dto.options.target_type,
          stamusEvent: dto.options.stamus_event,
          checkWebhooks: dto.options.checkWebhooks,
          ...(dto.options.all_tenants !== undefined
            ? { allTenants: dto.options.all_tenants }
            : {}),
          ...(dto.options.no_tenant !== undefined
            ? { noTenant: dto.options.no_tenant }
            : {}),
          ...(dto.options.tenants_str !== undefined
            ? { tenantsStr: dto.options.tenants_str }
            : {}),
        },
      };
    case 'send_mail':
      return {
        ...base,
        kind: 'sendMail',
        options: { maxMailsPerDay: dto.options.max_mails_per_day },
      };
  }
};

export const toFilterActionStats = (
  dto: FilterActionStatsDto,
): FilterActionStats => ({
  key: dto.key,
  docCount: dto.doc_count,
  drop: dto.drop.value,
  seen: dto.seen.value,
});

export const toFilterActionPayloadDto = (
  payload: FilterActionPayload,
): FilterActionPayloadDto => {
  const base = {
    filter_defs: payload.filterDefs.map(toFilterDefDto),
    rulesets: payload.rulesets,
    comment: payload.comment,
  };
  switch (payload.kind) {
    case 'threshold':
      return { ...base, action: 'threshold', options: payload.options };
    case 'suppress':
      return { ...base, action: 'suppress' };
    case 'tag':
      return { ...base, action: 'tag', options: payload.options };
    case 'tagAndKeep':
      return { ...base, action: 'tagkeep', options: payload.options };
    case 'threat':
      return {
        ...base,
        action: 'threat',
        options: {
          threat: payload.options.threat,
          kill_chain: payload.options.killChain,
          source_key: payload.options.sourceKey,
          target_key: payload.options.targetKey,
          track_offender: payload.options.trackOffender,
          track_target: payload.options.trackTarget,
          target_type: payload.options.targetType,
          stamus_event: payload.options.stamusEvent,
          checkWebhooks: payload.options.checkWebhooks,
          ...(payload.options.allTenants !== undefined
            ? { all_tenants: payload.options.allTenants }
            : {}),
          ...(payload.options.noTenant !== undefined
            ? { no_tenant: payload.options.noTenant }
            : {}),
          ...(payload.options.tenantsStr !== undefined
            ? { tenants_str: payload.options.tenantsStr }
            : {}),
        },
      };
    case 'sendMail':
      return {
        ...base,
        action: 'send_mail',
        options: { max_mails_per_day: payload.options.maxMailsPerDay },
      };
  }
};
