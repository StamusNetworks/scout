/**
 * Backward-compat shim. The canonical schema lives in `api/threat.dto.ts`
 * (see `docs/architecture.md` — ACL).
 *
 * Legacy code imports `Threat`, `threatSchema`, etc. from this file. New
 * code should import the domain `Threat` from `@/features/threats` (the
 * barrel) and never touch the DTO directly.
 */

export {
  threatDtoSchema as threatSchema,
  threatPayloadDtoSchema as threatPayload,
} from '../api/threat.dto';
export type {
  ThreatDto as Threat,
  ThreatPayloadDto as ThreatPayload,
  CombinedThreatDto as CombinedThreat,
} from '../api/threat.dto';
