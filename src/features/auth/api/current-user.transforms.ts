import type { CurrentUser } from '../model/current-user';
import type { CurrentUserDto } from './current-user.dto';

export const toCurrentUser = (dto: CurrentUserDto): CurrentUser => ({
  id: dto.pk,
  username: dto.username,
  firstName: dto.first_name,
  lastName: dto.last_name,
  email: dto.email,
  isActive: dto.is_active,
  joinedAt: dto.date_joined,
  permissions: dto.perms,
  role: dto.role,
  isVisibleWithoutTenant: dto.no_tenant,
  appliesToAllTenants: dto.all_tenant,
  tenants: dto.tenants,
  authMethod: dto.method,
  timezone: dto.timezone,
});
