import { z } from 'zod';

export const rulesetSchema = z.object({
  pk: z.number(),
  name: z.string(),
  descr: z.string(),
  created_date: z.string(),
  updated_date: z.string(),
  need_test: z.boolean(),
  validity: z.boolean(),
  errors: z.array(z.string()),
  rules_count: z.number(),
  sources: z.array(z.number()),
  categories: z.array(z.number()),
  warnings: z.string(),
  warnings_send_mail: z.string(),
});

export type Ruleset = z.infer<typeof rulesetSchema>;
