import { z } from 'zod';

import { ActiveThreatFamily } from './active-threat-family.dto';

export const threatFamilySchema = z.object({
  pk: z.number(),
  family_id: z.number(),
  name: z.string(),
  version: z.number(),
  icon: z.string(),
  description: z.string(),
  links: z.array(z.array(z.string())),
  klass: z.enum(['doc', 'dopv']),
});

export type ThreatFamily = z.infer<typeof threatFamilySchema>;

export type CombinedFamily = { family_class?: 'doc' | 'dopv' } & (
  | (ThreatFamily & { is_active: false })
  | (ThreatFamily & ActiveThreatFamily & { is_active: true })
);
