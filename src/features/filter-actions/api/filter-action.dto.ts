import { z } from 'zod';

import { killChainPhaseSchema } from '@/features/threats';

/**
 * Wire-shape (snake_case, server vocabulary). Internal to the
 * filter-actions bounded context — never imported outside `api/`.
 * Components and hooks consume the domain `FilterAction` from
 * `model/filter-action.ts` instead.
 */

export const filterActionTargetTypeDtoSchema = z.enum([
  'ip',
  'username',
  'mail',
]);

export const filterDefDtoSchema = z.object({
  key: z.string(),
  value: z.string().or(z.number()),
  operator: z.string(),
  full_string: z.boolean(),
  msg: z.string().optional(),
});

export type FilterDefDto = z.infer<typeof filterDefDtoSchema>;

const specificFieldsDtoSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('threshold'),
    options: z.object({
      type: z.string(),
      count: z.number(),
      seconds: z.number(),
      track: z.enum(['by_src', 'by_dst']),
    }),
  }),
  z.object({
    action: z.literal('suppress'),
  }),
  z.object({
    action: z.literal('tag'),
    options: z.object({
      tag: z.enum(['relevant', 'informational']),
    }),
  }),
  z.object({
    action: z.literal('tagkeep'),
    options: z.object({
      tag: z.enum(['relevant', 'informational']),
    }),
  }),
  z.object({
    action: z.literal('threat'),
    options: z.object({
      threat: z.string(),
      kill_chain: killChainPhaseSchema,
      source_key: z.string(),
      target_key: z.string(),
      track_offender: z.boolean(),
      track_target: z.boolean(),
      target_type: filterActionTargetTypeDtoSchema,
      stamus_event: z.boolean(),
      checkWebhooks: z.boolean(),
      all_tenants: z.boolean().optional(),
      no_tenant: z.boolean().optional(),
      tenants_str: z.array(z.string()).optional(),
    }),
  }),
  z.object({
    action: z.literal('send_mail'),
    options: z.object({
      max_mails_per_day: z.number().int().min(1),
    }),
  }),
]);

export const filterActionDtoSchema = z
  .object({
    pk: z.number(),
    event_type: z.string(),
    filter_defs: z.array(filterDefDtoSchema),
    rulesets: z.array(z.number()),
    index: z.number(),
    description: z.string(),
    enabled: z.boolean(),
    imported: z.boolean(),
    comment: z.string(),
    username: z.string(),
    creation_date: z.string(),
  })
  .and(specificFieldsDtoSchema);

export type FilterActionDto = z.infer<typeof filterActionDtoSchema>;
export type FilterActionActionDto = FilterActionDto['action'];

export const filterActionStatsDtoSchema = z.object({
  key: z.string(),
  doc_count: z.number(),
  drop: z.object({ value: z.number() }),
  seen: z.object({ value: z.number() }),
});

export type FilterActionStatsDto = z.infer<typeof filterActionStatsDtoSchema>;

const baseFilterActionPayloadDtoSchema = z.object({
  filter_defs: z.array(filterDefDtoSchema),
  rulesets: z.array(z.number()),
  comment: z.string(),
});

export const filterActionPayloadDtoSchema =
  baseFilterActionPayloadDtoSchema.and(specificFieldsDtoSchema);

export type FilterActionPayloadDto = z.infer<
  typeof filterActionPayloadDtoSchema
>;
