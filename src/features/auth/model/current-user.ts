/**
 * The currently authenticated user. Wire-shape fields like `pk`,
 * `is_active`, `date_joined`, `perms`, `no_tenant`, `all_tenant`, and
 * `method` are translated at the ACL — see `api/current-user.transforms.ts`.
 *
 * `joinedAt` is kept as an ISO string rather than a `Date` so the value
 * stays serializable in the RTK Query cache (Redux warns on non-
 * serializable values in state).
 */
export type CurrentUser = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  /**
   * ISO 8601 timestamp. Stored as a string so the value stays
   * serializable in the RTK Query cache; consumers can `new Date(...)`
   * on read if they need a `Date` instance.
   */
  joinedAt: string;
  permissions: string[];
  role: string;
  /**
   * Whether this user appears in the global view (when no tenant is
   * selected from the tenant picker). Independent of `appliesToAllTenants`.
   */
  isVisibleWithoutTenant: boolean;
  /**
   * Whether this user is implicitly granted access to all tenants
   * (current AND future). When false, `tenants` lists the explicit set.
   */
  appliesToAllTenants: boolean;
  tenants: number[];
  authMethod: string;
  timezone: string;
};
