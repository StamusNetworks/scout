/**
 * The Threat domain model — the language Scout uses to talk about threats
 * inside the bounded context. Translation to/from the wire happens in
 * `api/threat.transforms.ts`; this file knows nothing about HTTP.
 */

export type ThreatKind = 'compromise' | 'policyViolation';

/** UI label per kind. "Threat" is the historical product name for a compromise. */
export const KIND_LABEL: Record<ThreatKind, string> = {
  compromise: 'Threat',
  policyViolation: 'Policy Violation',
};

/**
 * Which tenants a threat applies to. `all` covers current AND future
 * tenants (no need to revisit when a tenant is added); `specific` pins the
 * threat to an explicit list.
 */
export type ThreatTenantScope =
  | { mode: 'all' }
  | { mode: 'specific'; tenantIds: number[] };

export type ThreatLink = {
  name: string;
  url: string;
  referenceType: string;
  /**
   * Whether the reference is specific to this threat or shared across
   * the family. The wire splits them; the domain flattens with this tag
   * so consumers can render a single list or filter by scope.
   */
  scope: 'threat' | 'family';
};

export type Threat = {
  id: number;
  threatId: number;
  kind: ThreatKind;
  name: string;
  description: string;
  additionalInfo?: string;
  severity: number;
  version: number;
  isActive: boolean;
  createdAt: Date;
  familyId: number;
  links: ThreatLink[];
  isUserDefined: boolean;
  methodCount: number;
  /**
   * Whether this threat appears in the global view (when no tenant is
   * selected from the tenant picker). Independent of `tenantScope`.
   */
  isVisibleWithoutTenant: boolean;
  tenantScope: ThreatTenantScope;
};

export type ThreatPayload = {
  kind: ThreatKind;
  name: string;
  description: string;
  additionalInfo?: string;
  isVisibleWithoutTenant: boolean;
  tenantScope: ThreatTenantScope;
};
