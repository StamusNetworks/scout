import { KillChainPhase } from '@/features/threats';

export type FilterActionTargetType = 'ip' | 'username' | 'mail';

export type FilterDef = {
  key: string;
  value: string | number;
  isNegated: boolean;
  isWildcarded: boolean;
  msg?: string;
};

type FilterActionBase = {
  id: number;
  eventType: string;
  filterDefs: FilterDef[];
  rulesets: number[];
  index: number;
  description: string;
  enabled: boolean;
  imported: boolean;
  comment: string;
  username: string;
  /** ISO 8601 date string. */
  createdAt: string;
};

export type ThresholdFilterAction = FilterActionBase & {
  kind: 'threshold';
  options: {
    type: string;
    count: number;
    seconds: number;
    track: 'by_src' | 'by_dst';
  };
};

export type SuppressFilterAction = FilterActionBase & {
  kind: 'suppress';
};

export type TagFilterAction = FilterActionBase & {
  kind: 'tag';
  options: {
    tag: 'relevant' | 'informational';
  };
};

export type TagAndKeepFilterAction = FilterActionBase & {
  kind: 'tagAndKeep';
  options: {
    tag: 'relevant' | 'informational';
  };
};

export type ThreatFilterAction = FilterActionBase & {
  kind: 'threat';
  options: {
    threat: string;
    killChain: KillChainPhase;
    sourceKey: string;
    targetKey: string;
    trackOffender: boolean;
    trackTarget: boolean;
    targetType: FilterActionTargetType;
    stamusEvent: boolean;
    checkWebhooks: boolean;
    allTenants?: boolean;
    noTenant?: boolean;
    tenantsStr?: string[];
  };
};

export type SendMailFilterAction = FilterActionBase & {
  kind: 'sendMail';
  options: {
    maxMailsPerDay: number;
  };
};

export type FilterAction =
  | ThresholdFilterAction
  | SuppressFilterAction
  | TagFilterAction
  | TagAndKeepFilterAction
  | ThreatFilterAction
  | SendMailFilterAction;

export type FilterActionKind = FilterAction['kind'];

export const FILTER_ACTION_KIND_LABEL: Record<FilterActionKind, string> = {
  threshold: 'Threshold',
  suppress: 'Suppress',
  tag: 'Tag',
  tagAndKeep: 'Tag and Keep',
  threat: 'Declaration',
  sendMail: 'Send mail',
};

export type FilterActionStats = {
  key: string;
  docCount: number;
  drop: number;
  seen: number;
};

type FilterActionPayloadBase = {
  filterDefs: FilterDef[];
  rulesets: number[];
  comment: string;
};

export type FilterActionPayload = FilterActionPayloadBase &
  (
    | { kind: 'threshold'; options: ThresholdFilterAction['options'] }
    | { kind: 'suppress' }
    | { kind: 'tag'; options: TagFilterAction['options'] }
    | { kind: 'tagAndKeep'; options: TagAndKeepFilterAction['options'] }
    | { kind: 'threat'; options: ThreatFilterAction['options'] }
    | { kind: 'sendMail'; options: SendMailFilterAction['options'] }
  );
