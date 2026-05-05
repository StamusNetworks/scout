import { z } from 'zod';

import { killChainPhaseSchema } from '@/features/threats/api/impacted-entity.dto';
import { KillChainPhase } from '@/features/threats/model/kill-chain';

export const threatHistorySchema = z.object({
  asset: z.string(),
  asset_type: z.string(),
  first_seen: z.string(),
  last_seen: z.string(),
  history: z.array(
    z.discriminatedUnion('history_type', [
      z.object({
        history_type: z.literal('first_seen'),
        timestamp: z.string(),
        params: z.object({
          step_kill_chain: killChainPhaseSchema,
          step_kill_chain_offender: killChainPhaseSchema.nullable(),
        }),
        threat_id: z.string(),
        is_offender: z.boolean(),
      }),
      z.object({
        history_type: z.literal('last_seen'),
        timestamp: z.string(),
        params: z.object({
          count: z.number(),
        }),
        threat_id: z.string(),
        is_offender: z.boolean(),
      }),
    ]),
  ),
  kc_change_history: z.array(
    z.union([
      z.object({
        timestamp: z.string(),
        threat_id: z.string(),
        is_offender: z.boolean(),
        step: killChainPhaseSchema,
        kc_step_offender: killChainPhaseSchema.nullable(),
      }),
      z.object({
        first_seen: z.string(),
      }),
      z.object({
        last_seen: z.string(),
      }),
    ]),
  ),
  tenant: z.number(),
  is_offender: z.boolean(),
});

export type ThreatHistory = z.infer<typeof threatHistorySchema>;

export type KCChange = {
  timestamp: string;
  threat_id: string;
  is_offender: boolean;
  step: string;
  kc_step_offender: string | null;
};

export type TimelineThreat = {
  threat_id: string;
  start_date: number;
  end_date: number;
  offender?: string;
  type: 'doc' | 'dopv' | 'offender';
};

export type TimelineKCPhase = {
  kc_phase: KillChainPhase;
  start_date: number;
  end_date: number;
};

export type TimelineEntity = {
  entity: string;
  threats: TimelineThreat[];
  kc_phases: TimelineKCPhase[];
};

export type TimelineProps = {
  entities: TimelineEntity[];
  start_date: number;
  end_date: number;
  lateralMovements: Record<
    string,
    { threat_id: string; offender_ip: string }[]
  >;
  entity?: string;
  index?: number;
};
