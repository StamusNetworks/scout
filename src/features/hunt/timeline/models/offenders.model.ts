import { z } from 'zod';

export const offendersSchema = z.object({
  res: z.object({
    assets: z.object({
      doc_count_error_upper_bound: z.number(),
      sum_other_doc_count: z.number(),
      buckets: z.array(
        z.object({
          key: z.string(),
          doc_count: z.number(),
          min_timestamp: z.object({
            value: z.number(),
            value_as_string: z.string(),
          }),
          max_timestamp: z.object({
            value: z.number(),
            value_as_string: z.string(),
          }),
          offenders: z.object({
            doc_count_error_upper_bound: z.number(),
            sum_other_doc_count: z.number(),
            buckets: z.array(
              z.object({
                key: z.string(),
                doc_count: z.number(),
                threat_id: z.object({
                  doc_count_error_upper_bound: z.number(),
                  sum_other_doc_count: z.number(),
                  buckets: z.array(
                    z.object({
                      key: z.string(),
                      doc_count: z.number(),
                      min_timestamp: z.object({
                        value: z.number(),
                        value_as_string: z.string(),
                      }),
                      max_timestamp: z.object({
                        value: z.number(),
                        value_as_string: z.string(),
                      }),
                    }),
                  ),
                }),
                min_timestamp: z.object({
                  value: z.number(),
                  value_as_string: z.string(),
                }),
                max_timestamp: z.object({
                  value: z.number(),
                  value_as_string: z.string(),
                }),
              }),
            ),
          }),
        }),
      ),
    }),
  }),
});

export type OffendersData = z.infer<typeof offendersSchema>;
