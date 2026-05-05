import { z } from 'zod';

export const currentUserDto = z.object({
  pk: z.number(),
  timezone: z.string(),
  username: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  is_active: z.boolean(),
  email: z.string(),
  date_joined: z.string(),
  perms: z.array(z.string()),
  role: z.string(),
  no_tenant: z.boolean(),
  all_tenant: z.boolean(),
  tenants: z.array(z.number()),
  method: z.string(),
});

export type CurrentUserDto = z.infer<typeof currentUserDto>;
