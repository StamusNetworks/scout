import { describe, expect, it } from 'vitest';

import type { FilterSetCreateInput } from '../model/filter-set';
import type { FilterSetDto } from './filter-set.dto';
import { toCreatePayloadDto, toFilterSet } from './filter-set.transforms';

const persistedFilter = (overrides: { id: string; value: string }) => ({
  id: overrides.id,
  label: '',
  value: overrides.value,
  fullString: true,
  negated: false,
});

describe('toFilterSet', () => {
  it('extracts filters and tags from the wire content union', () => {
    const dto: FilterSetDto = {
      id: 1,
      name: 'My set',
      description: 'desc',
      page: 'DASHBOARDS',
      imported: false,
      content: [
        persistedFilter({ id: 'src_ip', value: '10.0.0.1' }),
        {
          id: 'alert.tag',
          value: {
            stamus: false,
            alerts: true,
            sightings: true,
            informational: false,
            relevant: true,
            untagged: false,
          },
        },
        persistedFilter({ id: 'msg', value: 'foo' }),
      ],
    };

    expect(toFilterSet(dto)).toEqual({
      id: 1,
      name: 'My set',
      description: 'desc',
      page: 'DASHBOARDS',
      imported: false,
      share: undefined,
      filters: [
        persistedFilter({ id: 'src_ip', value: '10.0.0.1' }),
        persistedFilter({ id: 'msg', value: 'foo' }),
      ],
      tags: {
        stamus: false,
        alert: true, // wire `alerts` → domain `alert`
        discovery: true, // wire `sightings` → domain `discovery`
        informational: false,
        relevant: true,
        untagged: false,
      },
    });
  });

  it('returns tags as undefined when no alert.tag entry exists', () => {
    const dto: FilterSetDto = {
      id: 2,
      name: 'No tags',
      description: '',
      page: 'DASHBOARDS',
      imported: false,
      content: [persistedFilter({ id: 'src_ip', value: '10.0.0.1' })],
    };

    const result = toFilterSet(dto);
    expect(result.tags).toBeUndefined();
    expect(result.filters).toHaveLength(1);
  });

  it('defaults missing wire `stamus` to true', () => {
    const dto: FilterSetDto = {
      id: 3,
      name: 'No stamus',
      description: '',
      page: 'DASHBOARDS',
      imported: false,
      content: [
        {
          id: 'alert.tag',
          value: {
            // stamus omitted
            alerts: true,
            sightings: false,
            informational: true,
            relevant: false,
            untagged: false,
          },
        },
      ],
    };

    expect(toFilterSet(dto).tags?.stamus).toBe(true);
  });
});

describe('toCreatePayloadDto', () => {
  it('translates domain shape back to wire (alert→alerts, discovery→sightings)', () => {
    const input: FilterSetCreateInput = {
      name: 'X',
      page: 'DASHBOARDS',
      description: 'd',
      filters: [
        { key: 'src_ip', value: '10.0.0.1' },
        { key: 'msg', value: 'foo', isNegated: true, isWildcarded: true },
      ],
      tags: {
        stamus: true,
        alert: true,
        discovery: false,
        informational: true,
        relevant: false,
        untagged: true,
      },
    };

    expect(toCreatePayloadDto(input)).toEqual({
      name: 'X',
      page: 'DASHBOARDS',
      description: 'd',
      share: undefined,
      filters: [
        {
          id: 'src_ip',
          label: '',
          value: '10.0.0.1',
          fullString: true,
          negated: false,
          query: undefined,
        },
        {
          id: 'msg',
          label: '',
          value: 'foo',
          fullString: false,
          negated: true,
          query: undefined,
        },
      ],
      tags: {
        stamus: true,
        alerts: true,
        sightings: false,
        informational: true,
        relevant: false,
        untagged: true,
      },
    });
  });

  it("emits `query: 'query'` for the special es_filter id", () => {
    const result = toCreatePayloadDto({
      name: 'X',
      page: 'DASHBOARDS',
      description: '',
      filters: [{ key: 'es_filter', value: 'src_ip:"10.0.0.1"' }],
    });

    expect(result.filters[0]).toMatchObject({
      id: 'es_filter',
      query: 'query',
    });
  });

  it('omits tags when input has none', () => {
    const result = toCreatePayloadDto({
      name: 'X',
      page: 'DASHBOARDS',
      description: '',
      filters: [],
    });
    expect(result.tags).toBeUndefined();
  });

  it('roundtrips tags through toFilterSet → toCreatePayloadDto', () => {
    const dto: FilterSetDto = {
      id: 1,
      name: 'X',
      description: '',
      page: 'DASHBOARDS',
      imported: false,
      content: [
        {
          id: 'alert.tag',
          value: {
            stamus: true,
            alerts: false,
            sightings: true,
            informational: false,
            relevant: true,
            untagged: false,
          },
        },
      ],
    };

    const domain = toFilterSet(dto);
    const wire = toCreatePayloadDto({
      name: domain.name,
      page: domain.page,
      description: domain.description,
      filters: [],
      tags: domain.tags,
    });

    expect(wire.tags).toEqual({
      stamus: true,
      alerts: false,
      sightings: true,
      informational: false,
      relevant: true,
      untagged: false,
    });
  });
});
