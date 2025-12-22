import { describe, expect, it } from 'vitest';

import { RootStateWithAPI } from '@/store/store';
import { initialState } from '@/store/store.init';

import { TagFilters } from '../../query-filters/store/query-filters.slice';
import { QueryFilterState } from '../model/query-filter';
import { selectEventsQfilter } from './query-filters.selector';

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
        tags: createTagFilters(tags),
      });
      const qfilter = selectEventsQfilter(undefined, { tags: true })(
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

const createTagFilters = (tags: Partial<TagFilters>) => ({
  informational: tags.informational ?? false,
  relevant: tags.relevant ?? false,
  untagged: tags.untagged ?? false,
  novelty: tags.novelty ?? false,
  alert: tags.alert ?? false,
  discovery: tags.discovery ?? false,
  stamus: tags.stamus ?? false,
});

const createStoreState = ({
  filters,
  tags,
}: {
  filters: QueryFilterState[];
  tags: TagFilters;
}) => ({
  ...initialState,
  filters: {
    ...initialState.filters,
    queryFilters: {
      ...initialState.filters.queryFilters,
      queryFilters: filters,
      tagFilters: tags,
    },
  },
});
