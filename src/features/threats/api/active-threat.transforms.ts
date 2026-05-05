import { ActiveThreat, ActiveThreatAssets } from '../model/active-threat';
import { ThreatKind, ThreatLink } from '../model/threat';
import { ActiveThreat as ActiveThreatDto } from './active-threat.dto';

const KIND_BY_FAMILY_CLASS: Record<
  ActiveThreatDto['family_class'],
  ThreatKind
> = {
  doc: 'compromise',
  dopv: 'policyViolation',
};

export const toActiveThreatAssets = (
  dto: ActiveThreatDto['nb_assets'],
): ActiveThreatAssets => ({
  victims: dto.nb_victim,
  offenders: dto.nb_offender,
  bothVictimAndOffender: dto.nb_both,
  newVictims: dto.nb_new_victim,
  newOffenders: dto.nb_new_offender,
  fixedVictims: dto.nb_fixed_victim,
  fixedOffenders: dto.nb_fixed_offender,
  assignedVictims: dto.nb_assigned_victim,
  assignedOffenders: dto.nb_assigned_offender,
  falsePositiveVictims: dto.nb_false_positive_victim,
  falsePositiveOffenders: dto.nb_false_positive_offender,
});

const toLinks = (dto: ActiveThreatDto['links']): ThreatLink[] => [
  ...(Array.isArray(dto?.threat) ? dto.threat : []).map((l) => ({
    name: l.name,
    url: l.link,
    referenceType: l.reference_type,
    scope: 'threat' as const,
  })),
  ...(Array.isArray(dto?.family) ? dto.family : []).map((l) => ({
    name: l.name,
    url: l.link,
    referenceType: l.reference_type,
    scope: 'family' as const,
  })),
];

export const toActiveThreat = (dto: ActiveThreatDto): ActiveThreat => ({
  id: dto.pk,
  threatId: dto.threat_id,
  familyId: dto.family_id,
  kind: KIND_BY_FAMILY_CLASS[dto.family_class],
  name: dto.name,
  description: dto.description,
  version: dto.version,
  icon: dto.icon,
  links: toLinks(dto.links),
  maxSeverity: dto.max_criticity,
  malwareCount: dto.nb_malwares,
  assets: toActiveThreatAssets(dto.nb_assets),
});
