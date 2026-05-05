import { ThreatKind } from '../model/threat';
import { ThreatFamily } from '../model/threat-family';
import { ThreatFamily as ThreatFamilyDto } from './threat-family.dto';

const KIND_BY_KLASS: Record<ThreatFamilyDto['klass'], ThreatKind> = {
  doc: 'compromise',
  dopv: 'policyViolation',
};

export const toThreatFamily = (dto: ThreatFamilyDto): ThreatFamily => ({
  id: dto.pk,
  familyId: dto.family_id,
  kind: KIND_BY_KLASS[dto.klass],
  name: dto.name,
  description: dto.description,
  version: dto.version,
  icon: dto.icon,
  links: dto.links,
});
