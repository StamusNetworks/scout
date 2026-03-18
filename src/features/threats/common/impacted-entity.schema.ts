import { z } from 'zod';

export const killChainPhaseSchema = z.union([
  z.literal('reconnaissance'),
  z.literal('weaponization'),
  z.literal('delivery'),
  z.literal('exploitation'),
  z.literal('installation'),
  z.literal('command_and_control'),
  z.literal('actions_on_objectives'),
  z.literal('pre_condition'),
]);

export const threatSchema = z.object({
  threat__threat_id: z.number(),
  threat__name: z.string(),
  threat__family__family_id: z.number(),
  status: z.union([z.literal('new'), z.literal('fixed')]),
  kill_chain: z.number(),
  kill_chain_offender: z.number(),
  first_seen: z.string(),
  last_seen: z.string(),
});
export type EntityThreat = z.infer<typeof threatSchema>;

export const impactedEntitySchema = z.object({
  pk: z.number(),
  value: z.string(),
  asset_type: z.string(),
  tenant: z.number(),
  network_def: z.string(),
  first_seen: z.string(),
  last_seen: z.string(),
  threats: z.array(threatSchema),
  status: z.union([z.literal('new'), z.literal('fixed')]),
  fixed_date: z.string(),
  kill_chain: killChainPhaseSchema,
  kill_chain_offender: killChainPhaseSchema,
  is_offender: z.boolean(),
});
