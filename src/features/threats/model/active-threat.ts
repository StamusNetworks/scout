import { ThreatKind, ThreatLink } from './threat';

/**
 * Counts of assets touched by an active threat, broken down by role
 * (victim/offender) and lifecycle (new/fixed/assigned/false-positive).
 *
 * `bothVictimAndOffender` is the intersection — assets that appear in
 * both the victims and offenders sets — and is subtracted to compute a
 * deduplicated entity count.
 */
export type ActiveThreatAssets = {
  victims: number;
  offenders: number;
  bothVictimAndOffender: number;
  newVictims: number;
  newOffenders: number;
  fixedVictims: number;
  fixedOffenders: number;
  assignedVictims: number;
  assignedOffenders: number;
  falsePositiveVictims: number;
  falsePositiveOffenders: number;
};

export type ActiveThreat = {
  id: number;
  threatId: number;
  familyId: number;
  kind: ThreatKind;
  name: string;
  description: string;
  version: number;
  icon: string;
  links: ThreatLink[];
  maxSeverity: number;
  malwareCount: number;
  assets: ActiveThreatAssets;
};
