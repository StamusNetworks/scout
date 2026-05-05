import { KillChainPhase } from '@/features/threats';

import { Analysis } from './analysis';

export type RuleVersion = {
  id: number;
  analysis: Analysis;
  contentHtml: string;
  rev: number;
  version: number;
  content: string;
  state: boolean;
  isCommentedInSource: boolean;
  /** ISO 8601 — when this version was imported into the appliance. */
  importedAt: string;
  /** ISO 8601 — when the import metadata was last refreshed. */
  importedAtMeta: string;
  /** ISO 8601 — when the upstream rule was first authored. */
  createdAt: string;
  /** ISO 8601 — when the upstream rule was last edited. */
  updatedAt: string;
};

export type RuleCategory = {
  id: number;
  name: string;
  description: string;
  /** ISO 8601 date string. */
  createdAt: string;
  source: number;
};

export type RuleThreatInfo = {
  family: string;
  name: string;
  description: string;
  source: string;
  /** ISO 8601 date string. */
  createdAt: string;
  /** ISO 8601 date string. */
  updatedAt: string;
};

export type RuleMethod = {
  methodId: number;
  threatId: number;
  targetKey: string;
  sourceKey: string;
  extraInfo?: string;
  extraInfoName?: string;
  description: string;
  version: number;
  isActive: boolean;
  targetType: string;
  offenderType: string;
  methodType: string;
  killChainPhase: KillChainPhase | null;
  originalSid: number;
  oldContent: string;
  originalContent: string;
  threatContent: string;
  ownerId?: number;
  trackOffender: boolean;
  trackTarget: boolean;
  isUserDefined: boolean;
  actionId?: number;
};

export type Rule = {
  id: number;
  /** Suricata Signature ID. */
  sid: number;
  category: RuleCategory;
  msg: string;
  /** ISO 8601 date string. */
  createdAt: string;
  /** ISO 8601 date string. */
  updatedAt: string;
  hits: number;
  versions: RuleVersion[];
  threatInfo: RuleThreatInfo;
  method?: RuleMethod;
  timelineData: { date: number; hits: number };
};
