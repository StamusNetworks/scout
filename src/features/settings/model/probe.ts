/**
 * A Suricata probe attached to the appliance. The "appliance id"
 * naming is preserved because the backend keys probes by it.
 */
export type Probe = {
  applianceId: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  address: string;
  port: number;
  lastSeenAt: string;
  coresCount: number;
  cpuModel: string;
  memory: number;
  kernel: string;
  distribution: string;
  appIsUp: boolean;
  suriRunning: boolean;
  suriLastSeenAt: string;
};
