import { z } from 'zod';

export const AttackerInfrastructureAggregationSchema = z.object({
  took: z.number(),
  timed_out: z.boolean(),
  _shards: z.object({
    total: z.number(),
    successful: z.number(),
    skipped: z.number(),
    failed: z.number(),
  }),
  hits: z.object({
    total: z.object({
      value: z.number(),
      relation: z.string(),
    }),
    max_score: z.null(),
    hits: z.array(z.any()),
  }),
  aggregations: z.object({
    '2': z.object({
      doc_count_error_upper_bound: z.number(),
      sum_other_doc_count: z.number(),
      buckets: z.array(
        z.object({
          key: z.string(),
          doc_count: z.number(),
          '3': z.object({
            doc_count_error_upper_bound: z.number(),
            sum_other_doc_count: z.number(),
            buckets: z.array(
              z.object({
                key: z.string(),
                doc_count: z.number(),
                '4': z.object({
                  doc_count_error_upper_bound: z.number(),
                  sum_other_doc_count: z.number(),
                  buckets: z.array(
                    z.object({
                      key: z.string(),
                      doc_count: z.number(),
                      '5': z.object({
                        doc_count_error_upper_bound: z.number(),
                        sum_other_doc_count: z.number(),
                        buckets: z.array(
                          z.object({
                            key: z.string(),
                            doc_count: z.number(),
                          }),
                        ),
                      }),
                    }),
                  ),
                }),
              }),
            ),
          }),
        }),
      ),
    }),
  }),
});

export type AttackerInfrastructureAggregation = z.infer<
  typeof AttackerInfrastructureAggregationSchema
>;
