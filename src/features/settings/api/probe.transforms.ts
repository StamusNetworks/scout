import type { Probe } from '../model/probe';
import type { ProbeDto } from './probe.dto';

export const toProbe = (dto: ProbeDto): Probe => ({
  applianceId: dto.appliance_id,
  name: dto.name,
  description: dto.descr,
  createdAt: dto.created_date,
  updatedAt: dto.updated_date,
  address: dto.address,
  port: dto.port,
  lastSeenAt: dto.last_seen,
  coresCount: dto.cores_count,
  cpuModel: dto.cpu_model,
  memory: dto.memory,
  kernel: dto.kernel,
  distribution: dto.distribution,
  appIsUp: dto.app_is_up,
  suriRunning: dto.suri_running,
  suriLastSeenAt: dto.suri_last_seen,
});
