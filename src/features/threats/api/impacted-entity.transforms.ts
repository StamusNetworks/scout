import { EntityThreat, ImpactedEntity } from '../model/impacted-entity';
import { KillChainCountersData, phaseFromStep } from '../model/kill-chain';
import { EntityThreatDto, ImpactedEntityDto } from './impacted-entity.dto';

export const toEntityThreat = (dto: EntityThreatDto): EntityThreat => ({
  threatId: dto.threat__threat_id,
  name: dto.threat__name,
  familyId: dto.threat__family__family_id,
  status: dto.status,
  phase: phaseFromStep(dto.kill_chain) ?? null,
  offenderPhase: phaseFromStep(dto.kill_chain_offender) ?? null,
  isOffender: dto.kill_chain_offender > 0,
  firstSeen: dto.first_seen,
  lastSeen: dto.last_seen,
});

export const toImpactedEntity = (dto: ImpactedEntityDto): ImpactedEntity => ({
  id: dto.pk,
  value: dto.value,
  assetType: dto.asset_type,
  tenant: dto.tenant,
  networkDef: dto.network_def,
  firstSeen: dto.first_seen,
  lastSeen: dto.last_seen,
  fixedAt: dto.fixed_date || null,
  threats: dto.threats.map(toEntityThreat),
  status: dto.status,
  phase: dto.kill_chain,
  offenderPhase: dto.kill_chain_offender,
  isOffender: dto.is_offender,
});

export const toKillChainCounters = (
  dto: { kill_chain: keyof KillChainCountersData; nb_assets: number }[],
): KillChainCountersData =>
  dto.reduce<KillChainCountersData>((acc, { kill_chain, nb_assets }) => {
    acc[kill_chain] = nb_assets;
    return acc;
  }, {});
