import { describe, expect, test } from 'vitest';

import type { Threat } from './threat';
import { mergeThreatCollections, type ThreatCollection } from './threat-merge';

const threatA: Threat = {
  kind: 'compromise',
  id: 1,
  name: 'a',
} as unknown as Threat;
const threatB: Threat = {
  kind: 'compromise',
  id: 2,
  name: 'b',
} as unknown as Threat;
const threatC: Threat = {
  kind: 'compromise',
  id: 3,
  name: 'c',
} as unknown as Threat;

const primary: ThreatCollection = {
  ids: [1, 2],
  entities: { 1: threatA, 2: threatB },
};
const secondary: ThreatCollection = {
  ids: [3],
  entities: { 3: threatC },
};

describe('mergeThreatCollections', () => {
  test('concatenates ids with primary first', () => {
    expect(mergeThreatCollections(primary, secondary).ids).toEqual([1, 2, 3]);
  });

  test('merges entities from both', () => {
    expect(mergeThreatCollections(primary, secondary).entities).toEqual({
      1: threatA,
      2: threatB,
      3: threatC,
    });
  });

  test('returns empty collection when both are undefined', () => {
    expect(mergeThreatCollections(undefined, undefined)).toEqual({
      ids: [],
      entities: {},
    });
  });

  test('falls back gracefully when primary is undefined', () => {
    expect(mergeThreatCollections(undefined, secondary)).toEqual(secondary);
  });

  test('falls back gracefully when secondary is undefined', () => {
    expect(mergeThreatCollections(primary, undefined)).toEqual(primary);
  });

  test('secondary entries override primary on id collision', () => {
    const overlap: ThreatCollection = {
      ids: [1],
      entities: { 1: threatC },
    };
    expect(mergeThreatCollections(primary, overlap).entities[1]).toBe(threatC);
  });
});
