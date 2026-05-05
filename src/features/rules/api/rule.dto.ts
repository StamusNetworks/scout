import { z } from 'zod';

import { analysisSchema } from '../model/analysis';

/**
 * Wire-shape (snake_case, server vocabulary). Internal to the
 * detection-methods bounded context — never imported outside `api/`.
 * Components and hooks consume the domain `Rule` from
 * `model/rule.ts` instead.
 */

export const ruleVersionDtoSchema = z.object({
  id: z.number(),
  analysis: analysisSchema,
  content_html: z.string(),
  rev: z.number(),
  version: z.number(),
  content: z.string(),
  state: z.boolean(),
  commented_in_source: z.boolean(),
  imported_date: z.string(),
  updated_date: z.string(),
  created: z.string(),
  updated: z.string(),
});

export type RuleVersionDto = z.infer<typeof ruleVersionDtoSchema>;

export const ruleDtoSchema = z.object({
  pk: z.number(),
  sid: z.number(),
  category: z.object({
    pk: z.number(),
    name: z.string(),
    descr: z.string(),
    created_date: z.string(),
    source: z.number(),
  }),
  msg: z.string(),
  created: z.string(),
  updated: z.string(),
  hits: z.number(),
  versions: z.array(ruleVersionDtoSchema),
  threat_info: z.object({
    family: z.string(),
    name: z.string(),
    description: z.string(),
    source: z.string(),
    created: z.string(),
    updated: z.string(),
  }),
  method: z
    .object({
      method_id: z.number(),
      threat_id: z.number(),
      target_key: z.string(),
      source_key: z.string(),
      extra_info: z.string().optional(),
      extra_info_name: z.string().optional(),
      description: z.string(),
      version: z.number(),
      active: z.boolean(),
      target_type: z.string(),
      offender_type: z.string(),
      method_type: z.string(),
      kill_chain: z.number(),
      original_sid: z.number(),
      old_content: z.string(),
      original_content: z.string(),
      threat_content: z.string(),
      owner_id: z.number().optional(),
      track_offender: z.boolean(),
      track_target: z.boolean(),
      user_defined: z.boolean(),
      action_id: z.number().optional(),
    })
    .optional(),
  timeline_data: z.object({
    date: z.number(),
    hits: z.number(),
  }),
});

export type RuleDto = z.infer<typeof ruleDtoSchema>;
