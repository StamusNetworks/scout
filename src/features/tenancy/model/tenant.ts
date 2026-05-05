/**
 * Tenant identity inside Scout's multi-tenancy model. A tenant maps to a
 * network definition on the appliance side; in domain terms it is the
 * scope key that filters every tenant-aware query.
 */
export type Tenant = {
  tenantId: number;
  name: string;
};
