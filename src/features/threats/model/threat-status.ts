import { KillChainPhase } from './kill-chain';

/**
 * The current state of a threat-impact relationship between an asset
 * and a threat. The wire returns flat snake_case rows; the domain shape
 * uses camelCase and proper Date types.
 */
export type ThreatStatus = {
  id: number;
  status: 'new' | 'fixed';
  tenant: number;
  threatId: number;
  asset: string;
  isOffender: boolean;
  phase: KillChainPhase;
  offenderPhase: KillChainPhase;
  firstSeen: Date;
  lastSeen: Date;
  closedAt: Date | null;
};
