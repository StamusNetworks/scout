import { z } from 'zod';

import { ActiveThreat } from './active-threat.model';

export const threatSchema = z.object({
  pk: z.number(),
  threat_id: z.number(),
  name: z.string(),
  description: z.string(),
  additional_info: z.string().optional(),
  criticity: z.number(),
  version: z.number(),
  active: z.boolean(),
  creation_date: z.string(),
  family: z.number(),
  family_class: z.enum(['doc', 'dopv']),
  links: z.array(
    z.object({
      name: z.string(),
      link: z.string(),
      reference_type: z.string(),
    }),
  ),
  user_defined: z.boolean(),
  nb_methods: z.number(),
  tenants: z.array(z.number()),
  no_tenant: z.boolean(),
  all_tenants: z.boolean(),
});

export type Threat = z.infer<typeof threatSchema>;

export type CombinedThreat = { family_class?: 'doc' | 'dopv' } & (
  | (Threat & { is_active: false })
  | (Threat & ActiveThreat & { is_active: true })
);

export const threatPayload = z.object({
  family_class: z.enum(['doc', 'dopv']),
  name: z.string().min(1),
  description: z.string().min(1),
  additional_info: z.string().optional(),
  no_tenant: z.boolean(),
  all_tenants: z.boolean(),
  tenants: z.array(z.number()),
});

export type ThreatPayload = z.infer<typeof threatPayload>;
