/**
 * Suricata's rule-analysis dump. Wire-passthrough: this structure is
 * rendered nearly verbatim in the rule-analysis UI, so we keep snake_case
 * leaf fields (`is_mpm`, `app_proto`, `frame_engines`, etc.) rather than
 * fan out an expensive translation that adds no domain clarity. The Zod
 * schema doubles as the parser used by the api layer.
 */
import z from 'zod';

export const contentMatchSchema = z.object({
  name: z.literal('content'),
  content: z.object({
    pattern: z.string(),
    length: z.number(),
    nocase: z.boolean(),
    negated: z.boolean(),
    starts_with: z.boolean(),
    ends_with: z.boolean(),
    is_mpm: z.boolean(),
    no_double_inspect: z.boolean(),
    fast_pattern: z.boolean(),
    relative_next: z.boolean(),
  }),
});
export type ContentMatch = z.infer<typeof contentMatchSchema>;

export const pcreMatchSchema = z.object({
  name: z.literal('pcre'),
  pcre: z.object({
    pattern: z.string(),
    relative: z.boolean(),
    relative_next: z.boolean(),
    nocase: z.boolean(),
    negated: z.boolean(),
  }),
});
export type PcreMatch = z.infer<typeof pcreMatchSchema>;

export const luaMatchSchema = z.object({
  name: z.literal('lua'),
  lua: z.object({
    code: z.string(),
    relative: z.boolean(),
    relative_next: z.boolean(),
    nocase: z.boolean(),
    negated: z.boolean(),
  }),
});
export type LuaMatch = z.infer<typeof luaMatchSchema>;

export const flowMatchSchema = z.object({
  name: z.literal('flow'),
  flow: z.object({
    to_server: z.boolean(),
    to_client: z.boolean(),
    established: z.boolean(),
    not_established: z.boolean(),
    stateless: z.boolean(),
    only_stream: z.boolean(),
    no_stream: z.boolean(),
    no_frag: z.boolean(),
    only_frag: z.boolean(),
  }),
});
export type FlowMatch = z.infer<typeof flowMatchSchema>;

export const flowbitsMatchSchema = z.object({
  name: z.literal('flowbits'),
  flowbits: z.object({
    cmd: z.string(),
    operator: z.string().optional(),
    names: z.array(z.string()),
  }),
});
export type FlowbitsMatch = z.infer<typeof flowbitsMatchSchema>;

export const datasetMatchSchema = z.object({
  name: z.literal('dataset'),
  dataset: z.object({
    name: z.string(),
    type: z.string(),
    load: z.string(),
    save: z.string(),
    cmd: z.string(),
  }),
});
export type DatasetMatch = z.infer<typeof datasetMatchSchema>;

export const isdataatMatchSchema = z.object({
  name: z.literal('isdataat'),
  isdataat: z.object({
    offset: z.number(),
    relative: z.boolean(),
  }),
});
export type IsdataatMatch = z.infer<typeof isdataatMatchSchema>;

export const bsizeMatchSchema = z.object({
  name: z.literal('bsize'),
  bsize: z.object({
    mode: z.union([
      z.literal('eq'),
      z.literal('neq'),
      z.literal('gt'),
      z.literal('ge'),
      z.literal('lt'),
      z.literal('le'),
      z.literal('range'),
    ]),
    arg1: z.string(),
    arg2: z.string(),
  }),
});
export type BsizeMatch = z.infer<typeof bsizeMatchSchema>;

export const byteTestMatchSchema = z.object({
  name: z.literal('byte_test'),
  byte_test: z.object({
    nbytes: z.number(),
    offset: z.number(),
    base: z.string(),
    flags: z.array(z.string()),
  }),
});
export type ByteTestMatch = z.infer<typeof byteTestMatchSchema>;

export const byteJumpMatchSchema = z.object({
  name: z.literal('byte_jump'),
  byte_jump: z.object({
    nbytes: z.number(),
    offset: z.number(),
    multiplier: z.number(),
    post_offset: z.number(),
    base: z.string(),
    flags: z.array(z.string()),
  }),
});
export type ByteJumpMatch = z.infer<typeof byteJumpMatchSchema>;

export const thresholdMatchSchema = z.object({
  name: z.literal('threshold'),
});
export type ThresholdMatch = z.infer<typeof thresholdMatchSchema>;

export type Match =
  | ContentMatch
  | PcreMatch
  | LuaMatch
  | DatasetMatch
  | FlowMatch
  | FlowbitsMatch
  | IsdataatMatch
  | BsizeMatch
  | ByteTestMatch
  | ByteJumpMatch
  | ThresholdMatch;

const engineSchema = z.object({
  name: z.string(),
  direction: z.string(),
  is_mpm: z.boolean(),
  app_proto: z.string(),
  progress: z.number(),
  transforms: z.array(z.object({ name: z.string() })),
  matches: z.array(
    z.discriminatedUnion('name', [
      contentMatchSchema,
      pcreMatchSchema,
      luaMatchSchema,
      datasetMatchSchema,
      flowbitsMatchSchema,
      isdataatMatchSchema,
      bsizeMatchSchema,
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
          z.discriminatedUnion('name', [flowMatchSchema, flowbitsMatchSchema]),
        ),
      })
      .optional(),
    payload: z
      .object({
        matches: z.array(
          z.discriminatedUnion('name', [
            byteJumpMatchSchema,
            byteTestMatchSchema,
            contentMatchSchema,
            pcreMatchSchema,
          ]),
        ),
      })
      .optional(),
    postmatch: z
      .object({
        matches: z.array(
          z.discriminatedUnion('name', [
            datasetMatchSchema,
            flowbitsMatchSchema,
          ]),
        ),
      })
      .optional(),
    threshold: z
      .object({
        matches: z.array(z.discriminatedUnion('name', [thresholdMatchSchema])),
      })
      .optional(),
  }),
  mpm: z.object({
    buffer: z.string(),
    content: contentMatchSchema.pick({ content: true }),
  }),
});
export type Analysis = z.infer<typeof analysisSchema>;
