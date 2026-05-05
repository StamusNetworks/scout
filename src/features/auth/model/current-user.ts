/**
 * The currently authenticated user. Wire-shape fields like `pk`,
 * `is_active`, `date_joined`, `perms`, `no_tenant`, `all_tenant`, and
 * `method` are translated at the ACL — see `api/current-user.transforms.ts`.
 */
export type CurrentUser = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  joinedAt: Date;
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
