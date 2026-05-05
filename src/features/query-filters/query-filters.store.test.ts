import { describe, expect, it } from 'vitest';

import { setupStore } from '@/store/store';
import { initialState } from '@/store/store.init';

import { QueryFilterState } from './query-filter.model';
import { selectQueryFilters } from './query-filters.selectors';
import {
  clearQueryFilters,
  setAlertTags,
  setEventTypes,
  setNovelty,
  setQueryFilters,
} from './query-filters.store';

describe('Query Filters Slice', () => {
  const testFilters: QueryFilterState[] = [
    {
      id: 'dfd9016d-757c-4b2e-951b-343fb6659f49',
      key: 'src_ip',
      value: '10.0.0.1',
      is_suspended: false,
      is_negated: false,
      is_wildcarded: false,
    },
    {
      id: '343fb665-951b-757c-4b2e-9f49dfd9016d',
      key: 'dest_ip',
      value: '10.0.0.51',
      is_suspended: false,
      is_negated: false,
      is_wildcarded: false,
    },
    {
      id: '757c9f49-343f-951b-4b2e-90dfb665d16d',
      key: 'alert.signature_id',
      value: '10.0.0.51',
      is_suspended: false,
      is_negated: false,
      is_wildcarded: false,
    },
  ];

  describe('setQueryFilters', () => {
    it('should replace the entire query filters array', () => {
      const store = setupStore(initialState);
      store.dispatch(setQueryFilters(testFilters));

      expect(selectQueryFilters(store.getState())).toEqual(testFilters);
    });

    it('should overwrite existing filters with a new array', () => {
      const store = setupStore({
        ...initialState,
        filters: {
          ...initialState.filters,
          queryFilters: {
            ...initialState.filters.queryFilters,
            queryFilters: testFilters,
          },
        },
      });

      const newFilters = [testFilters[0]];
      store.dispatch(setQueryFilters(newFilters));

      expect(selectQueryFilters(store.getState())).toEqual(newFilters);
    });
  });

  describe('clearQueryFilters', () => {
    it('should empty the query filters array', () => {
      const store = setupStore({
        ...initialState,
        filters: {
          ...initialState.filters,
          queryFilters: {
            ...initialState.filters.queryFilters,
            queryFilters: testFilters,
          },
        },
      });

      store.dispatch(clearQueryFilters());

      expect(selectQueryFilters(store.getState())).toEqual([]);
    });
  });

  describe('setEventTypes', () => {
    it('should merge partial event-type flags into existing state', () => {
      const store = setupStore(initialState);

      store.dispatch(setEventTypes({ alert: false, stamus: false }));

      const { flags } = store.getState().filters.queryFilters;
      expect(flags.eventTypes.alert).toBe(false);
      expect(flags.eventTypes.stamus).toBe(false);
      expect(flags.eventTypes.discovery).toBe(true);
    });

    it('should not affect other flag groups', () => {
      const store = setupStore(initialState);

      store.dispatch(setEventTypes({ alert: false }));

      const { flags } = store.getState().filters.queryFilters;
      expect(flags.alertTags.informational).toBe(true);
      expect(flags.alertTags.relevant).toBe(true);
      expect(flags.alertTags.untagged).toBe(true);
      expect(flags.novelty).toBe(false);
    });
  });

  describe('setAlertTags', () => {
    it('should merge partial alert-tag flags into existing state', () => {
      const store = setupStore(initialState);

      store.dispatch(setAlertTags({ informational: false }));

      const { flags } = store.getState().filters.queryFilters;
      expect(flags.alertTags.informational).toBe(false);
      expect(flags.alertTags.relevant).toBe(true);
      expect(flags.alertTags.untagged).toBe(true);
    });
  });

  describe('setNovelty', () => {
    it('should toggle the novelty flag', () => {
      const store = setupStore(initialState);

      store.dispatch(setNovelty(true));

      const { flags } = store.getState().filters.queryFilters;
      expect(flags.novelty).toBe(true);
      expect(flags.eventTypes.alert).toBe(true);
    });
  });
});
