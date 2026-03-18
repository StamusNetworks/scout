import { z } from 'zod';

import { impactedEntitySchema, threatSchema } from './impacted-entity.schema';

export type Entity = z.infer<typeof impactedEntitySchema>;

export type Threat = z.infer<typeof threatSchema>;
