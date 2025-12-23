import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const anomalySchema = z.object({
  type: z.string(),
  app_proto: z.string(),
  event: z.string(),
  layer: z.string(),
});

export const anomalyEventSchema = baseFlowEventSchema.extend({
  event_type: z.literal('anomaly'),
  anomaly: anomalySchema,
});

export type Anomaly = z.infer<typeof anomalyEventSchema>;
