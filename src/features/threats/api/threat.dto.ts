import { z } from 'zod';

import { ActiveThreat } from './active-threat.dto';

/**
 * Wire-shape (snake_case, server vocabulary). Internal to the threats
 * bounded context — never imported outside `api/`. Components and hooks
 * consume the domain `Threat` type from `model/threat.ts` instead.
 */
export const threatDtoSchema = z.object({
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
  links: z.object({
    threat: z.array(
      z.object({
        name: z.string(),
        link: z.string(),
        reference_type: z.string(),
      }),
    ),
    family: z.array(
      z.object({
        name: z.string(),
        link: z.string(),
        reference_type: z.string(),
      }),
    ),
  }),
  user_defined: z.boolean(),
  nb_methods: z.number(),
  tenants: z.array(z.number()),
  no_tenant: z.boolean(),
  all_tenants: z.boolean(),
});

export type ThreatDto = z.infer<typeof threatDtoSchema>;

export type CombinedThreatDto = { family_class?: 'doc' | 'dopv' } & (
  | (ThreatDto & { is_active: false })
  | (ThreatDto & ActiveThreat & { is_active: true })
);

export const threatPayloadDtoSchema = z.object({
  family_class: z.enum(['doc', 'dopv']),
  name: z.string().min(1),
  description: z.string().min(1),
  additional_info: z.string().optional(),
  no_tenant: z.boolean(),
  all_tenants: z.boolean(),
  tenants: z.array(z.number()),
});

export type ThreatPayloadDto = z.infer<typeof threatPayloadDtoSchema>;
