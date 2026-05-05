import { ThreatStatus } from '../model/threat-status';
import { ThreatStatus as ThreatStatusDto } from './threat-status.dto';

export const toThreatStatus = (dto: ThreatStatusDto): ThreatStatus => ({
  id: dto.id,
  status: dto.status,
  tenant: dto.tenant,
  threatId: dto.threat_id,
  asset: dto.asset,
  isOffender: dto.is_offender,
  phase: dto.kill_chain,
  offenderPhase: dto.kill_chain_offender,
  firstSeen: dto.first_seen,
  lastSeen: dto.last_seen,
  closedAt: dto.close_status_date || null,
});
