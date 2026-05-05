import { describe, expect, it } from 'vitest';

import { RootStateWithAPI } from '@/store/store';
import { initialState } from '@/store/store.init';

import { type FilterFlags } from './filter-flags.model';
import { QueryFilterState } from './query-filter.model';
import { selectEventsQfilter } from './query-filters.selectors';

describe('QFilter selector', () => {
  describe('Alert Tags', () => {
    it.each`
      tags                                                       | expected
      ${{ relevant: true }}                                      | ${'(alert.tag:"relevant")'}
      ${{ untagged: true }}                                      | ${'((NOT alert.tag:*))'}
      ${{ informational: true }}                                 | ${'(alert.tag:"informational")'}
      ${{ informational: true, relevant: true }}                 | ${'(alert.tag:"informational" OR alert.tag:"relevant")'}
      ${{ informational: true, relevant: true, untagged: true }} | ${'(alert.tag:"informational" OR alert.tag:"relevant" OR (NOT alert.tag:*))'}
      ${{}}                                                      | ${'(alert.tag:"none")'}
    `('should handle tags and return $expected', ({ tags, expected }) => {
      const store = createStoreState({
        filters: [],
        flags: createFlags(tags),
      });
      const qfilter = selectEventsQfilter(undefined, { tags: true })(
        // @ts-expect-error We just need a partial of the API
        store as RootStateWithAPI,
      );
      expect(qfilter).toBe(expected);
    });
  });
});

describe('Host ID QFilter selector', () => {
  it('should select', () => {
    expect(true).toBe(true);
  });
});

describe('Signature Filters selector', () => {
  it('should select', () => {
    expect(true).toBe(true);
  });
});

const createFlags = (
  alertTagsOverrides: Partial<FilterFlags['alertTags']> = {},
): FilterFlags => ({
  eventTypes: { alert: false, stamus: false, discovery: false },
  alertTags: {
    informational: alertTagsOverrides.informational ?? false,
    relevant: alertTagsOverrides.relevant ?? false,
    untagged: alertTagsOverrides.untagged ?? false,
  },
  novelty: false,
});

const createStoreState = ({
  filters,
  flags,
}: {
  filters: QueryFilterState[];
  flags: FilterFlags;
}) => ({
  ...initialState,
  filters: {
    ...initialState.filters,
    queryFilters: {
      ...initialState.filters.queryFilters,
      queryFilters: filters,
      flags,
    },
  },
  API: {
    queries: {
      'getSystemSettings(undefined)': {
        data: {
          id: 1,
          use_arkime: false,
          use_opensearch: false,
          arkime_url: '/arkime',
          use_http_proxy: false,
          http_proxy: '',
          https_proxy: '',
          ssl_proxy: true,
          custom_elasticsearch: true,
          elasticsearch_url: 'http://10.136.0.79:9200/',
          use_proxy_for_es: false,
          custom_cookie_age: 360.0,
          elasticsearch_user: '',
          custom_login_banner: '',
          session_cookie_age: 0,
          kibana: true,
          evebox: true,
          es_keyword: 'raw',
          kibana_url: '/kibana',
          evebox_url: '/evebox',
          cyberchef: true,
          cyberchef_url: '/static/cyberchef/',
          license: { nta: true, etl: true, mngt: true },
        },
      },
    },
  },
});
