import { KillChainPhase } from './kill-chain';

/**
 * A single threat (or policy violation) targeting an impacted entity.
 * Domain-shaped representation of the wire `entityThreatSchema`, with
 * Django ORM lookup names (`threat__threat_id`) flattened.
 */
export type EntityThreat = {
  threatId: number;
  name: string;
  familyId: number;
  status: 'new' | 'fixed';
  phase: KillChainPhase | null;
  offenderPhase: KillChainPhase | null;
  isOffender: boolean;
  /** ISO 8601 date string. */
  firstSeen: string;
  /** ISO 8601 date string. */
  lastSeen: string;
};

/**
 * An asset that is or was impacted by one or more threats. Keyed by
 * `id` (the wire-level `pk`).
 */
export type ImpactedEntity = {
  id: number;
  value: string;
  assetType: string;
  tenant: number;
  networkDef: string;
  /** ISO 8601 date string. */
  firstSeen: string;
  /** ISO 8601 date string. */
  lastSeen: string;
  /** ISO 8601 date string, or null if not yet fixed. */
  fixedAt: string | null;
  threats: EntityThreat[];
  status: 'new' | 'fixed';
  phase: KillChainPhase;
  offenderPhase: KillChainPhase;
  isOffender: boolean;
};
