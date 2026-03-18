import { z } from 'zod';

const TimelineBucketSchema = z.object({
  key_as_string: z.string(),
  key: z.number(),
  doc_count: z.number(),
});

const DateAggregationSchema = z.object({
  buckets: z.array(TimelineBucketSchema),
});

const AggregationsSchema = z.object({
  date: DateAggregationSchema,
});

const HitsSchema = z.object({
  total: z.object({
    value: z.number(),
    relation: z.string(),
  }),
  max_score: z.null(),
  hits: z.array(z.any()),
});

const ShardsSchema = z.object({
  total: z.number(),
  successful: z.number(),
  skipped: z.number(),
  failed: z.number(),
});

export const EventsTimelineSchema = z.object({
  took: z.number(),
  timed_out: z.boolean(),
  _shards: ShardsSchema,
  hits: HitsSchema,
  aggregations: AggregationsSchema,
});

export type EventsTimeline = z.infer<typeof EventsTimelineSchema>;
