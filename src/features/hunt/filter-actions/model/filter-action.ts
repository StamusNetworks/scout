import { z } from 'zod';

import {
  filterActionSchema,
  filterActionStatsSchema,
} from './filter-action.schema.ts';

export type FilterAction = z.infer<typeof filterActionSchema>;

export type FilterActionStats = z.infer<typeof filterActionStatsSchema>;
