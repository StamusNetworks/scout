import z from 'zod';

import {
  bsizeMatch,
  byteJumpMatch,
  byteTestMatch,
  contentMatch,
  datasetMatch,
  flowbitsMatch,
  flowMatch,
  isdataatMatch,
  luaMatch,
  pcreMatch,
  thresholdMatch,
} from './analysis.matches';

const engineSchema = z.object({
  name: z.string(),
  direction: z.string(),
  is_mpm: z.boolean(),
  app_proto: z.string(),
  progress: z.number(),
  transforms: z.array(
    z.object({
      name: z.string(),
    }),
  ),
  matches: z.array(
    z.discriminatedUnion('name', [
      contentMatch,
      pcreMatch,
      luaMatch,
      datasetMatch,
      flowbitsMatch,
      isdataatMatch,
      bsizeMatch,
    ]),
  ),
});
export type Engine = z.infer<typeof engineSchema>;

export const analysisSchema = z.object({
  id: z.number(),
  gid: z.number(),
  rev: z.number(),
  msg: z.string(),
  app_proto: z.string(),
  requirements: z.array(z.string()),
  type: z.string(),
  flags: z.array(z.string()),
  pkt_engines: z.array(
    z.object({
      name: z.string(),
      is_mpm: z.boolean(),
    }),
  ),
  frame_engines: z.array(z.string()),
  engines: z.array(engineSchema),
  lists: z.object({
    packet: z
      .object({
        matches: z.array(
          z.discriminatedUnion('name', [flowMatch, flowbitsMatch]),
        ),
      })
      .optional(),
    payload: z
      .object({
        matches: z.array(
          z.discriminatedUnion('name', [
            byteJumpMatch,
            byteTestMatch,
            contentMatch,
            pcreMatch,
          ]),
        ),
      })
      .optional(),
    postmatch: z
      .object({
        matches: z.array(
          z.discriminatedUnion('name', [datasetMatch, flowbitsMatch]),
        ),
      })
      .optional(),
    threshold: z
      .object({
        matches: z.array(z.discriminatedUnion('name', [thresholdMatch])),
      })
      .optional(),
  }),
  mpm: z.object({
    buffer: z.string(),
    content: contentMatch.pick({ content: true }),
  }),
});
export type Analysis = z.infer<typeof analysisSchema>;
