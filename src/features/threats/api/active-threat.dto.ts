import { z } from 'zod';

export const activeThreatSchema = z.object({
  pk: z.number(),
  threat_id: z.number(),
  family_id: z.number(),
  name: z.string(),
  version: z.number(),
  icon: z.string(),
  description: z.string(),
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
  family_class: z.enum(['doc', 'dopv']),
  max_criticity: z.number(),
  nb_malwares: z.number(),
  nb_assets: z.object({
    nb_both: z.number(),
    nb_offender: z.number(),
    nb_victim: z.number(),
    nb_new_victim: z.number(),
    nb_new_offender: z.number(),
    nb_fixed_victim: z.number(),
    nb_fixed_offender: z.number(),
    nb_assigned_victim: z.number(),
    nb_assigned_offender: z.number(),
    nb_false_positive_victim: z.number(),
    nb_false_positive_offender: z.number(),
  }),
});

export type ActiveThreat = z.infer<typeof activeThreatSchema>;
