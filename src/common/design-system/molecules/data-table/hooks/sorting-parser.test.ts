import { describe, expect, it } from 'vitest';

import { parseSorting, serializeSorting } from './sorting-parser';

describe('serializeSorting', () => {
  it('serializes empty sorting to undefined', () => {
    expect(serializeSorting([])).toBeUndefined();
  });

  it('serializes ascending sort', () => {
    expect(serializeSorting([{ id: 'timestamp', desc: false }])).toBe(
      'timestamp',
    );
  });

  it('serializes descending sort', () => {
    expect(serializeSorting([{ id: 'timestamp', desc: true }])).toBe(
      '-timestamp',
    );
  });

  it('serializes multi-column sort', () => {
    expect(
      serializeSorting([
        { id: 'timestamp', desc: true },
        { id: 'severity', desc: false },
      ]),
    ).toBe('-timestamp,severity');
  });

  it('serializes hyphenated column id ascending', () => {
    expect(serializeSorting([{ id: 'last-seen', desc: false }])).toBe(
      'last-seen',
    );
  });

  it('serializes hyphenated column id descending', () => {
    expect(serializeSorting([{ id: 'last-seen', desc: true }])).toBe(
      '-last-seen',
    );
  });
});

describe('parseSorting', () => {
  it('parses ascending sort', () => {
    expect(parseSorting('timestamp')).toEqual([
      { id: 'timestamp', desc: false },
    ]);
  });

  it('parses descending sort', () => {
    expect(parseSorting('-timestamp')).toEqual([
      { id: 'timestamp', desc: true },
    ]);
  });

  it('parses multi-column sort', () => {
    expect(parseSorting('-timestamp,severity')).toEqual([
      { id: 'timestamp', desc: true },
      { id: 'severity', desc: false },
    ]);
  });

  it('parses hyphenated column id ascending', () => {
    expect(parseSorting('last-seen')).toEqual([
      { id: 'last-seen', desc: false },
    ]);
  });

  it('parses hyphenated column id descending', () => {
    expect(parseSorting('-last-seen')).toEqual([
      { id: 'last-seen', desc: true },
    ]);
  });

  it('returns empty array for undefined', () => {
    expect(parseSorting(undefined)).toEqual([]);
  });

  it('round-trips correctly', () => {
    const original = '-timestamp,last-seen,-host-id.services';
    const parsed = parseSorting(original);
    expect(serializeSorting(parsed)).toBe(original);
  });
});
