import z from 'zod';

export const baseFilterActionSchema = z.object({
  filters: z
    .array(
      z.object({
        key: z.string(),
        value: z.string().or(z.number()),
        isNegated: z.boolean(),
        isWildcarded: z.boolean(),
        enabled: z.boolean(),
      }),
    )
    .refine((value) => value.some((item) => item.enabled), {
      message: 'You have to have at least enabled filter.',
    }),
  rulesets: z.array(z.number()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one item.',
  }),
  comment: z.string().optional(),
});
