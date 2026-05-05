import { describe, expect, it } from 'vitest';

import { FilterType } from '../definitions/query-filter.config';
import { resolveEntityTypes } from './entity-validators';

describe('resolveEntityTypes', () => {
  it('returns undefined when entity is undefined', () => {
    expect(resolveEntityTypes(undefined, 'anything')).toBeUndefined();
  });

  it('returns single entity as-is (no runtime validation)', () => {
    expect(resolveEntityTypes(FilterType.IP, 'not-an-ip')).toBe(FilterType.IP);
    expect(resolveEntityTypes(FilterType.DOMAIN, '192.168.1.1')).toBe(
      FilterType.DOMAIN,
    );
  });

  it('filters array to only IP when value is an IP address', () => {
    const result = resolveEntityTypes(
      [FilterType.IP, FilterType.DOMAIN],
      '192.168.1.1',
    );
    expect(result).toEqual([FilterType.IP]);
  });

  it('filters array to only IP for IPv6 address', () => {
    const result = resolveEntityTypes(
      [FilterType.IP, FilterType.DOMAIN],
      '::1',
    );
    expect(result).toEqual([FilterType.IP]);
  });

  it('filters array to only DOMAIN when value is a domain', () => {
    const result = resolveEntityTypes(
      [FilterType.IP, FilterType.DOMAIN],
      'example.com',
    );
    expect(result).toEqual([FilterType.DOMAIN]);
  });

  it('filters array to only EMAIL when value is an email', () => {
    const result = resolveEntityTypes(
      [FilterType.IP, FilterType.EMAIL, FilterType.USERNAME],
      'user@example.com',
    );
    expect(result).toEqual([FilterType.EMAIL]);
  });

  it('filters array to only USERNAME when value is a plain username', () => {
    const result = resolveEntityTypes(
      [FilterType.IP, FilterType.EMAIL, FilterType.USERNAME],
      'johndoe',
    );
    expect(result).toEqual([FilterType.USERNAME]);
  });

  it('passes through all types without validators (SHA256/FILE_HASH)', () => {
    const result = resolveEntityTypes(
      [FilterType.SHA256, FilterType.FILE_HASH],
      'abc123',
    );
    expect(result).toEqual([FilterType.SHA256, FilterType.FILE_HASH]);
  });

  it('includes types without validators alongside validated matches', () => {
    const result = resolveEntityTypes(
      [FilterType.IP, FilterType.SHA256],
      '192.168.1.1',
    );
    expect(result).toEqual([FilterType.IP, FilterType.SHA256]);
  });

  it('handles DOMAIN and USERNAME both matching for non-IP non-email values', () => {
    const result = resolveEntityTypes(
      [FilterType.IP, FilterType.EMAIL, FilterType.DOMAIN],
      'example.com',
    );
    expect(result).toEqual([FilterType.DOMAIN]);
  });

  it('handles numeric values by converting to string', () => {
    const result = resolveEntityTypes(
      [FilterType.IP, FilterType.DOMAIN],
      12345,
    );
    expect(result).toEqual([FilterType.DOMAIN]);
  });
});
