import { describe, expect, it } from 'vitest';

import type { CurrentUserDto } from './current-user.dto';
import { toCurrentUser } from './current-user.transforms';

const dto: CurrentUserDto = {
  pk: 42,
  timezone: 'UTC',
  username: 'jdoe',
  first_name: 'Jane',
  last_name: 'Doe',
  is_active: true,
  email: 'jane@example.com',
  date_joined: '2024-01-15T08:30:00Z',
  perms: ['rules.events_view', 'rules.events_edit'],
  role: 'admin',
  no_tenant: false,
  all_tenant: true,
  tenants: [1, 2, 3],
  method: 'oidc',
};

describe('toCurrentUser', () => {
  it('maps wire fields to domain shape', () => {
    expect(toCurrentUser(dto)).toEqual({
      id: 42,
      timezone: 'UTC',
      username: 'jdoe',
      firstName: 'Jane',
      lastName: 'Doe',
      isActive: true,
      email: 'jane@example.com',
      joinedAt: '2024-01-15T08:30:00Z',
      permissions: ['rules.events_view', 'rules.events_edit'],
      role: 'admin',
      isVisibleWithoutTenant: false,
      appliesToAllTenants: true,
      tenants: [1, 2, 3],
      authMethod: 'oidc',
    });
  });

  it.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ])(
    'preserves no_tenant=%s and all_tenant=%s independently',
    (no_tenant, all_tenant) => {
      const result = toCurrentUser({ ...dto, no_tenant, all_tenant });
      expect(result.isVisibleWithoutTenant).toBe(no_tenant);
      expect(result.appliesToAllTenants).toBe(all_tenant);
    },
  );
});
