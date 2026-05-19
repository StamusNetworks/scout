import { describe, expect, it } from 'vitest';

import type { FilterSet } from '@/features/filter-sets';
import type { QueryFilterState } from '@/features/query-filters';
import { QFBuilder } from '@/features/query-filters/builders/qf-builder';

import type { HuntingTrailQuery } from '../definitions/hunting-trail.config';
import { buildQueryParams } from './build-query-params';

const qfBuilder = QFBuilder({});

const makeFilterSet = (overrides: Partial<FilterSet> = {}): FilterSet => ({
  id: -88,
  name: 'Hunt: Newly Registered Domains (NRD)',
  description: 'NRD description',
  page: 'DASHBOARDS',
  imported: false,
  share: 'static',
  filters: [
    {
      id: 'alert.signature',
      label: '',
      value: 'NRD',
      negated: false,
      fullString: false,
    },
  ],
  tags: {
    stamus: true,
    alert: true,
    discovery: true,
    informational: true,
    relevant: true,
    untagged: true,
  },
  ...overrides,
});

describe('buildQueryParams', () => {
  describe('filterset kind', () => {
    it('routes DASHBOARDS filterset to alerts_tail', () => {
      const fs = makeFilterSet({ page: 'DASHBOARDS' });
      const query: HuntingTrailQuery = {
        id: 'nrd',
        kind: 'filterset',
        filtersetId: -88,
      };
      const result = buildQueryParams(query, [fs], undefined, qfBuilder);
      if (result.isMissing) throw new Error('should not be missing');
      expect(result.endpoint).toBe('alerts_tail');
    });

    it('routes SESSION_EVENTS filterset to events_tail', () => {
      const fs = makeFilterSet({
        id: -107,
        page: 'SESSION_EVENTS',
        name: 'Investigate: SSH flows',
      });
      const query: HuntingTrailQuery = {
        id: 'ssh',
        kind: 'filterset',
        filtersetId: -107,
      };
      const result = buildQueryParams(query, [fs], undefined, qfBuilder);
      if (result.isMissing) throw new Error('should not be missing');
      expect(result.endpoint).toBe('events_tail');
    });

    it('returns isMissing: true when filterset id is not in the list', () => {
      const result = buildQueryParams(
        { id: 'phantom', kind: 'filterset', filtersetId: -9999 },
        [],
        undefined,
        qfBuilder,
      );
      expect(result.isMissing).toBe(true);
      expect(result.id).toBe('phantom');
    });

    it('uses the filterset name and description for display', () => {
      const fs = makeFilterSet({
        name: 'Custom Name',
        description: 'Custom Description',
      });
      const result = buildQueryParams(
        { id: 'nrd', kind: 'filterset', filtersetId: -88 },
        [fs],
        undefined,
        qfBuilder,
      );
      if (result.isMissing) throw new Error('should not be missing');
      expect(result.name).toBe('Custom Name');
      expect(result.description).toBe('Custom Description');
    });

    it('builds qfilter via QFBuilder.toQFString from filterset filters', () => {
      const fs = makeFilterSet({
        filters: [
          {
            id: 'alert.signature',
            label: '',
            value: 'NRD',
            negated: false,
            fullString: false,
          },
        ],
        tags: {
          stamus: true,
          alert: true,
          discovery: true,
          informational: true,
          relevant: true,
          untagged: true,
        },
      });
      const result = buildQueryParams(
        { id: 'nrd', kind: 'filterset', filtersetId: -88 },
        [fs],
        undefined,
        qfBuilder,
      );
      if (result.isMissing) throw new Error('should not be missing');
      // QFBuilder wildcards a non-fullString string value, producing a *value*
      // wildcard match expression.
      expect(result.qfilter).toContain('NRD');
    });

    it('alertTags default to all true when filterset tags is undefined', () => {
      const fs = makeFilterSet({ tags: undefined });
      // Spy on QFBuilder by using a builder whose toQFString we can inspect
      const calls: Array<{
        filters: Omit<QueryFilterState, 'id'>[] | undefined;
        alertTags: unknown;
      }> = [];
      const spyBuilder = {
        toQFString: (
          filters: Omit<QueryFilterState, 'id'>[] | undefined,
          alertTags: unknown,
        ) => {
          calls.push({ filters, alertTags });
          return 'STUB_QFILTER';
        },
      };
      buildQueryParams(
        { id: 'nrd', kind: 'filterset', filtersetId: -88 },
        [fs],
        undefined,
        spyBuilder,
      );
      expect(calls).toHaveLength(1);
      expect(calls[0].alertTags).toEqual({
        relevant: true,
        untagged: true,
        informational: true,
      });
    });

    it('alertTags honors explicit false from filterset tags but defaults true otherwise', () => {
      const fs = makeFilterSet({
        tags: {
          stamus: true,
          alert: true,
          discovery: true,
          informational: false,
          relevant: true,
          untagged: true,
        },
      });
      const calls: Array<{ alertTags: unknown }> = [];
      const spyBuilder = {
        toQFString: (_filters: unknown, alertTags: unknown) => {
          calls.push({ alertTags });
          return 'STUB';
        },
      };
      buildQueryParams(
        { id: 'nrd', kind: 'filterset', filtersetId: -88 },
        [fs],
        undefined,
        spyBuilder,
      );
      expect(calls[0].alertTags).toEqual({
        relevant: true,
        untagged: true,
        informational: false,
      });
    });

    it('eventTypeFlags default to all true when filterset tags is undefined', () => {
      const fs = makeFilterSet({ tags: undefined });
      const result = buildQueryParams(
        { id: 'nrd', kind: 'filterset', filtersetId: -88 },
        [fs],
        undefined,
        qfBuilder,
      );
      if (result.isMissing) throw new Error('should not be missing');
      expect(result.eventTypeFlags).toEqual({
        alert: true,
        stamus: true,
        discovery: true,
      });
    });

    it('eventTypeFlags honor explicit false from filterset tags but default true otherwise', () => {
      const fs = makeFilterSet({
        tags: {
          stamus: false,
          alert: true,
          discovery: true,
          informational: true,
          relevant: true,
          untagged: true,
        },
      });
      const result = buildQueryParams(
        { id: 'nrd', kind: 'filterset', filtersetId: -88 },
        [fs],
        undefined,
        qfBuilder,
      );
      if (result.isMissing) throw new Error('should not be missing');
      expect(result.eventTypeFlags).toEqual({
        alert: true,
        stamus: false,
        discovery: true,
      });
    });

    it('alertTags treats a missing partial tag as true', () => {
      // Tags partial with only stamus:false — alert tag fields all missing
      const fs = makeFilterSet({
        tags: {
          stamus: false,
        } as never,
      });
      const calls: Array<{ alertTags: unknown }> = [];
      const spyBuilder = {
        toQFString: (_filters: unknown, alertTags: unknown) => {
          calls.push({ alertTags });
          return 'STUB';
        },
      };
      buildQueryParams(
        { id: 'nrd', kind: 'filterset', filtersetId: -88 },
        [fs],
        undefined,
        spyBuilder,
      );
      expect(calls[0].alertTags).toEqual({
        relevant: true,
        untagged: true,
        informational: true,
      });
    });
  });

  describe('host_id filters (HOSTS_LIST filtersets)', () => {
    it('extracts host_id.* content into hostIdQfilter', () => {
      const fs = makeFilterSet({
        id: -86,
        page: 'HOSTS_LIST',
        name: 'Policy: Unencrypted SMTP service',
        filters: [
          {
            id: 'host_id.services.values.app_proto',
            label: '',
            value: 'smtp',
            negated: false,
            fullString: true,
          },
        ],
      });
      const result = buildQueryParams(
        { id: 'unencryptedSmtpService', kind: 'filterset', filtersetId: -86 },
        [fs],
        undefined,
        qfBuilder,
      );
      if (result.isMissing) throw new Error('should not be missing');
      expect(result.hostIdQfilter).toBeDefined();
      expect(result.hostIdQfilter).toContain(
        'host_id.services.values.app_proto',
      );
      expect(result.hostIdQfilter).toContain('smtp');
    });

    it('leaves hostIdQfilter undefined when filterset has no host_id filters', () => {
      const fs = makeFilterSet({ id: -88 });
      const result = buildQueryParams(
        { id: 'nrd', kind: 'filterset', filtersetId: -88 },
        [fs],
        undefined,
        qfBuilder,
      );
      if (result.isMissing) throw new Error('should not be missing');
      expect(result.hostIdQfilter).toBeUndefined();
    });
  });

  describe('static kind', () => {
    it('eventTypeFlags default to all true', () => {
      const result = buildQueryParams(
        {
          id: 'sightings',
          kind: 'static',
          endpoint: 'alerts_tail',
          qfilter: 'discovery:*',
          name: 'Sightings',
          description: '',
        },
        [],
        undefined,
        qfBuilder,
      );
      if (result.isMissing) throw new Error('should not be missing');
      expect(result.eventTypeFlags).toEqual({
        alert: true,
        stamus: true,
        discovery: true,
      });
    });

    it('returns declared endpoint and qfilter verbatim', () => {
      const query: HuntingTrailQuery = {
        id: 'sightings',
        kind: 'static',
        endpoint: 'alerts_tail',
        qfilter: 'event_type:alert AND discovery:*',
        name: 'Sightings',
        description: 'Sightings description',
      };
      const result = buildQueryParams(query, [], undefined, qfBuilder);
      if (result.isMissing) throw new Error('should not be missing');
      expect(result.endpoint).toBe('alerts_tail');
      expect(result.qfilter).toBe('event_type:alert AND discovery:*');
    });

    it('returns declared name and description', () => {
      const query: HuntingTrailQuery = {
        id: 'sightings',
        kind: 'static',
        endpoint: 'alerts_tail',
        qfilter: 'event_type:alert AND discovery:*',
        name: 'Sightings',
        description: 'Sightings description',
      };
      const result = buildQueryParams(query, [], undefined, qfBuilder);
      if (result.isMissing) throw new Error('should not be missing');
      expect(result.name).toBe('Sightings');
      expect(result.description).toBe('Sightings description');
    });
  });

  describe('additionalFilter as string', () => {
    it('prepends additionalFilter string before the filterset qfilter (matches Slice A behavior)', () => {
      const fs = makeFilterSet();
      const result = buildQueryParams(
        { id: 'nrd', kind: 'filterset', filtersetId: -88 },
        [fs],
        '(src_ip:10.0.0.5 OR dest_ip:10.0.0.5)',
        qfBuilder,
      );
      if (result.isMissing) throw new Error('should not be missing');
      // additionalFilter is prepended (caller scope first), preserving Slice A's
      // contract `${additionalFilter} AND ${rawQfilter}`.
      expect(
        result.qfilter.startsWith('(src_ip:10.0.0.5 OR dest_ip:10.0.0.5) AND '),
      ).toBe(true);
    });

    it('AND-appends to static qfilter', () => {
      const result = buildQueryParams(
        {
          id: 'sightings',
          kind: 'static',
          endpoint: 'alerts_tail',
          qfilter: 'event_type:alert AND discovery:*',
          name: 'Sightings',
          description: '',
        },
        [],
        '(src_ip:10.0.0.5 OR dest_ip:10.0.0.5)',
        qfBuilder,
      );
      if (result.isMissing) throw new Error('should not be missing');
      expect(result.qfilter).toBe(
        '(src_ip:10.0.0.5 OR dest_ip:10.0.0.5) AND event_type:alert AND discovery:*',
      );
    });
  });

  describe('additionalFilter as QueryFilterState[]', () => {
    it('prepends array filters before filterset content via QFBuilder', () => {
      const fs = makeFilterSet();
      const extra: QueryFilterState[] = [
        {
          id: 'x',
          key: 'src_ip',
          value: '10.0.0.5',
          isSuspended: false,
          isNegated: false,
          isWildcarded: false,
        },
      ];
      const calls: Array<{ filters: Omit<QueryFilterState, 'id'>[] }> = [];
      const spyBuilder = {
        toQFString: (filters: Omit<QueryFilterState, 'id'>[]) => {
          calls.push({ filters });
          return 'STUB';
        },
      };
      buildQueryParams(
        { id: 'nrd', kind: 'filterset', filtersetId: -88 },
        [fs],
        extra,
        spyBuilder,
      );
      expect(calls[0].filters[0].key).toBe('src_ip');
      expect(calls[0].filters[0].value).toBe('10.0.0.5');
    });

    it('AND-appends array-built qfilter to static qfilter', () => {
      const extra: QueryFilterState[] = [
        {
          id: 'x',
          key: 'src_ip',
          value: '10.0.0.5',
          isSuspended: false,
          isNegated: false,
          isWildcarded: false,
        },
      ];
      const result = buildQueryParams(
        {
          id: 'sightings',
          kind: 'static',
          endpoint: 'alerts_tail',
          qfilter: 'event_type:alert AND discovery:*',
          name: 'Sightings',
          description: '',
        },
        [],
        extra,
        qfBuilder,
      );
      if (result.isMissing) throw new Error('should not be missing');
      expect(result.qfilter).toContain('event_type:alert AND discovery:*');
      expect(result.qfilter).toContain('src_ip');
    });
  });
});
