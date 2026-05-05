export type EventTypeFlags = {
  alert: boolean;
  stamus: boolean;
  discovery: boolean;
};

export type AlertTagFlags = {
  relevant: boolean;
  untagged: boolean;
  informational: boolean;
};

export type FilterFlags = {
  eventTypes: EventTypeFlags;
  alertTags: AlertTagFlags;
  novelty: boolean;
};

/**
 * Flat shape used at persistence and wire boundaries: share URLs and
 * investigation history. The live slice uses `FilterFlags` (nested);
 * these transforms cross the boundary.
 *
 * `filter-sets/model/filter-set.ts:FilterSetTags` is structurally the
 * same as this minus `novelty` — filter-sets deliberately don't
 * persist novelty. The two are kept parallel rather than merged
 * because they cross independent persistence boundaries.
 */
export type SerializedFilterFlags = EventTypeFlags &
  AlertTagFlags & {
    novelty: boolean;
  };

export const toFilterFlags = (s: SerializedFilterFlags): FilterFlags => ({
  eventTypes: {
    alert: s.alert,
    stamus: s.stamus,
    discovery: s.discovery,
  },
  alertTags: {
    relevant: s.relevant,
    untagged: s.untagged,
    informational: s.informational,
  },
  novelty: s.novelty,
});

export const toSerializedFilterFlags = (
  f: FilterFlags,
): SerializedFilterFlags => ({
  alert: f.eventTypes.alert,
  stamus: f.eventTypes.stamus,
  discovery: f.eventTypes.discovery,
  relevant: f.alertTags.relevant,
  untagged: f.alertTags.untagged,
  informational: f.alertTags.informational,
  novelty: f.novelty,
});

export const defaultFilterFlags: FilterFlags = {
  eventTypes: { alert: true, stamus: true, discovery: true },
  alertTags: { relevant: true, untagged: true, informational: true },
  novelty: false,
};
