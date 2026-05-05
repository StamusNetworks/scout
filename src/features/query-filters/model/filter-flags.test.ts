import { describe, expect, it } from 'vitest';

import {
  defaultFilterFlags,
  type FilterFlags,
  type SerializedFilterFlags,
  toFilterFlags,
  toSerializedFilterFlags,
} from './filter-flags';

const allTrueSerialized: SerializedFilterFlags = {
  alert: true,
  stamus: true,
  discovery: true,
  relevant: true,
  informational: true,
  untagged: true,
  novelty: true,
};

const mixedSerialized: SerializedFilterFlags = {
  alert: true,
  stamus: false,
  discovery: true,
  relevant: false,
  informational: true,
  untagged: false,
  novelty: false,
};

describe('toFilterFlags', () => {
  it('nests the flat shape into eventTypes/alertTags/novelty', () => {
    expect(toFilterFlags(mixedSerialized)).toEqual({
      eventTypes: { alert: true, stamus: false, discovery: true },
      alertTags: { relevant: false, informational: true, untagged: false },
      novelty: false,
    });
  });
});

describe('toSerializedFilterFlags', () => {
  it('flattens the nested shape into the wire/persistence shape', () => {
    const nested: FilterFlags = {
      eventTypes: { alert: true, stamus: false, discovery: true },
      alertTags: { relevant: false, informational: true, untagged: false },
      novelty: false,
    };
    expect(toSerializedFilterFlags(nested)).toEqual(mixedSerialized);
  });
});

describe('roundtrip', () => {
  it('toSerializedFilterFlags(toFilterFlags(x)) is identity', () => {
    expect(toSerializedFilterFlags(toFilterFlags(mixedSerialized))).toEqual(
      mixedSerialized,
    );
    expect(toSerializedFilterFlags(toFilterFlags(allTrueSerialized))).toEqual(
      allTrueSerialized,
    );
  });

  it('toFilterFlags(toSerializedFilterFlags(x)) is identity', () => {
    expect(toFilterFlags(toSerializedFilterFlags(defaultFilterFlags))).toEqual(
      defaultFilterFlags,
    );
  });
});
