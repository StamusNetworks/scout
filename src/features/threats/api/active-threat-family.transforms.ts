import { ActiveThreatFamily } from '../model/active-threat-family';
import { ActiveThreatFamily as ActiveThreatFamilyDto } from './active-threat-family.dto';
import { toActiveThreatAssets } from './active-threat.transforms';
import { toThreatFamily } from './threat-family.transforms';

export const toActiveThreatFamily = (
  dto: ActiveThreatFamilyDto,
): ActiveThreatFamily => ({
  // ActiveThreatFamilyDto has the same `klass` discriminator as ThreatFamilyDto
  // but the dto type is structurally a superset, so reuse toThreatFamily.
  ...toThreatFamily({
    pk: dto.pk,
    family_id: dto.family_id,
    name: dto.name,
    version: dto.version,
    icon: dto.icon,
    description: dto.description,
    links: dto.links,
    klass: dto.klass,
  }),
  maxSeverity: dto.max_criticity,
  malwareCount: dto.nb_malwares,
  assets: toActiveThreatAssets(dto.nb_assets),
});
