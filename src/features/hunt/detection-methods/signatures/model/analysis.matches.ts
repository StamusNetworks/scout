import z from 'zod';

export const contentMatch = z.object({
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
export type ContentMatch = z.infer<typeof contentMatch>;

export const pcreMatch = z.object({
  name: z.literal('pcre'),
  pcre: z.object({
    pattern: z.string(),
    relative: z.boolean(),
    relative_next: z.boolean(),
    nocase: z.boolean(),
    negated: z.boolean(),
  }),
});
export type PcreMatch = z.infer<typeof pcreMatch>;

export const luaMatch = z.object({
  name: z.literal('lua'),
  lua: z.object({
    code: z.string(),
    relative: z.boolean(),
    relative_next: z.boolean(),
    nocase: z.boolean(),
    negated: z.boolean(),
  }),
});
export type LuaMatch = z.infer<typeof luaMatch>;

export const flowMatch = z.object({
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
export type FlowMatch = z.infer<typeof flowMatch>;

export const flowbitsMatch = z.object({
  name: z.literal('flowbits'),
  flowbits: z.object({
    cmd: z.string(),
    operator: z.string().optional(),
    names: z.array(z.string()),
  }),
});
export type FlowbitsMatch = z.infer<typeof flowbitsMatch>;

export const datasetMatch = z.object({
  name: z.literal('dataset'),
  dataset: z.object({
    name: z.string(),
    type: z.string(),
    load: z.string(),
    save: z.string(),
    cmd: z.string(),
  }),
});
export type DatasetMatch = z.infer<typeof datasetMatch>;

export const isdataatMatch = z.object({
  name: z.literal('isdataat'),
  isdataat: z.object({
    offset: z.number(),
    relative: z.boolean(),
  }),
});
export type IsdataatMatch = z.infer<typeof isdataatMatch>;

export const bsizeMatch = z.object({
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
export type BsizeMatch = z.infer<typeof bsizeMatch>;

export const byteTestMatch = z.object({
  name: z.literal('byte_test'),
  byte_test: z.object({
    nbytes: z.number(),
    offset: z.number(),
    base: z.string(),
    flags: z.array(z.string()),
  }),
});
export type ByteTestMatch = z.infer<typeof byteTestMatch>;

export const byteJumpMatch = z.object({
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
export type ByteJumpMatch = z.infer<typeof byteJumpMatch>;

export const thresholdMatch = z.object({
  name: z.literal('threshold'),
});
export type ThresholdMatch = z.infer<typeof thresholdMatch>;

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
