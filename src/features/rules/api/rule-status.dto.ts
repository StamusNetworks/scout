import { z } from 'zod';

const validitySchema = z.object({
  status: z.boolean(),
  info: z.array(z.string()),
  warnings: z.array(z.string()),
  errors: z.array(z.string()),
});

const transformationsSchema = z.object({
  action: z.string().nullable(),
  lateral: z.string(),
  target: z.string(),
});

/**
 * Wire shape returned by `GET /rules/rule/:pk/status/`. The endpoint
 * keys each ruleset by its pk (as a string), and within that record
 * the rule's own pk (also stringified) carries the per-rule
 * `{ active }` flag. We surface the rule-level activity at the top.
 */
export type RuleStatusEntryDto = {
  name: string;
  valid: z.infer<typeof validitySchema>;
  transformations: z.infer<typeof transformationsSchema>;
} & {
  [rulePk: string]: { active: boolean };
};

export type RuleStatusResponseDto = Record<string, RuleStatusEntryDto>;
