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
  /** ISO 8601 date string. */
  firstSeen: string;
  /** ISO 8601 date string. */
  lastSeen: string;
  /** ISO 8601 date string, or null if still open. */
  closedAt: string | null;
};
