import { z } from 'zod';

import { killChainSchema } from '@/features/threats/common/killchain/killchain';

export const filterActionTargetType = z.enum(['ip', 'username', 'mail']);
export const filterDefSchema = z.object({
  key: z.string(),
  value: z.string().or(z.number()),
  operator: z.string(),
  full_string: z.boolean(),
  msg: z.string().optional(),
});

export const specificFields = z.discriminatedUnion('action', [
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
      kill_chain: killChainSchema,
      source_key: z.string(),
      target_key: z.string(),
      track_offender: z.boolean(),
      track_target: z.boolean(),
      target_type: filterActionTargetType,
      stamus_event: z.boolean(),
      checkWebhooks: z.boolean(),
      all_tenants: z.boolean().optional(),
      no_tenant: z.boolean().optional(),
      tenants_str: z.array(z.string()).optional(),
    }),
  }),
]);

export const filterActionSchema = z
  .object({
    pk: z.number(),
    event_type: z.string(),
    filter_defs: z.array(filterDefSchema),
    rulesets: z.array(z.number()),
    index: z.number(),
    description: z.string(),
    enabled: z.boolean(),
    imported: z.boolean(),
    comment: z.string(),
    username: z.string(),
    creation_date: z.string(),
    options: z.object({}),
  })
  .and(specificFields);

export type FilterAction = z.infer<typeof filterActionSchema>;
export type SuppressFilterAction = FilterAction & { action: 'suppress' };
export type TagFilterAction = FilterAction & { action: 'tag' | 'tagkeep' };
export type ThresholdFilterAction = FilterAction & { action: 'threshold' };
export type ThreatFilterAction = FilterAction & { action: 'threat' };

export const filterActionStatsSchema = z.object({
  key: z.string(),
  doc_count: z.number(),
  drop: z.object({
    value: z.number(),
  }),
  seen: z.object({
    value: z.number(),
  }),
});

export const baseFilterActionPayloadSchema = z.object({
  filter_defs: z.array(
    z.object({
      key: z.string(),
      value: z.string().or(z.number()),
      operator: z.string(),
      full_string: z.boolean(),
      msg: z.string().optional(),
    }),
  ),
  rulesets: z.array(z.number()),
  comment: z.string(),
});

export const filterActionPayloadSchema =
  baseFilterActionPayloadSchema.and(specificFields);

export type FilterActionPayload = z.infer<typeof filterActionPayloadSchema>;
