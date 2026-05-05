import { ThreatStatus } from '../model/threat-status';
import { ThreatStatus as ThreatStatusDto } from './threat-status.dto';

const optionalDate = (s: string | null | undefined): Date | null =>
  s ? new Date(s) : null;

export const toThreatStatus = (dto: ThreatStatusDto): ThreatStatus => ({
  id: dto.id,
  status: dto.status,
  tenant: dto.tenant,
  threatId: dto.threat_id,
  asset: dto.asset,
  isOffender: dto.is_offender,
  phase: dto.kill_chain,
  offenderPhase: dto.kill_chain_offender,
  firstSeen: new Date(dto.first_seen),
  lastSeen: new Date(dto.last_seen),
  closedAt: optionalDate(dto.close_status_date),
});
