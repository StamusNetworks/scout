import { describe, expect, it } from 'vitest';

import { parseAsSorting, serializeSorting } from './sorting-parser';

describe('serializeSorting', () => {
  it('serializes empty sorting to empty string', () => {
    expect(serializeSorting([])).toBe('');
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

describe('parseAsSorting', () => {
  it('parses ascending sort', () => {
    expect(parseAsSorting.parse('timestamp')).toEqual([
      { id: 'timestamp', desc: false },
    ]);
  });

  it('parses descending sort', () => {
    expect(parseAsSorting.parse('-timestamp')).toEqual([
      { id: 'timestamp', desc: true },
    ]);
  });

  it('parses multi-column sort', () => {
    expect(parseAsSorting.parse('-timestamp,severity')).toEqual([
      { id: 'timestamp', desc: true },
      { id: 'severity', desc: false },
    ]);
  });

  it('parses hyphenated column id ascending', () => {
    expect(parseAsSorting.parse('last-seen')).toEqual([
      { id: 'last-seen', desc: false },
    ]);
  });

  it('parses hyphenated column id descending', () => {
    expect(parseAsSorting.parse('-last-seen')).toEqual([
      { id: 'last-seen', desc: true },
    ]);
  });

  it('round-trips correctly', () => {
    const original = '-timestamp,last-seen,-host-id.services';
    const parsed = parseAsSorting.parse(original)!;
    expect(parseAsSorting.serialize(parsed)).toBe(original);
  });
});
