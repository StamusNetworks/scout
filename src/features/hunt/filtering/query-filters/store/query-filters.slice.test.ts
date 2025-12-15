import { beforeEach, describe, expect, it } from 'vitest';

import { setupStore } from '@/store/store';
import { initialState } from '@/store/store.init';

import { QueryFiltersRecord } from '../constants/query-filter.definition';
import { QueryFilterState } from '../model/query-filter';
import { QFBuilder } from '../utils/qf-builder';
import { selectQueryFilters } from './query-filters.selector';
import {
  addQueryFilter,
  clearSuspendedFilters,
  deleteQueryFilter,
  suspendQueryFilter,
  updateQueryFilter,
} from './query-filters.slice';

describe('Managing Query Filters', () => {
  let reduxStore: ReturnType<typeof setupStore>;
  const QF = QFBuilder(QueryFiltersRecord, 'raw');
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

  describe('Basic filter CRUD operations', () => {
    beforeEach(() => {
      reduxStore = setupStore({
        ...initialState,
        filters: {
          ...initialState.filters,
          queryFilters: {
            ...initialState.filters.queryFilters,
            queryFilters: testFilters,
          },
        },
      });
    });

    it('Should create a new query filter', () => {
      const newFilter = { key: 'asset', value: '10.0.0.19' };
      reduxStore.dispatch(addQueryFilter(newFilter));

      expectFilters(selectQueryFilters(reduxStore.getState()), [
        ...testFilters,
        QF.createFilter(newFilter.key, newFilter.value),
      ]);
    });

    it('Should update a query filter', () => {
      const patchIndex = 1;
      const patch = { value: '10.0.0.2' };

      reduxStore.dispatch(
        updateQueryFilter({ ...testFilters[patchIndex], ...patch }),
      );

      expectFilters(selectQueryFilters(reduxStore.getState()), [
        ...testFilters.slice(0, patchIndex),
        { ...testFilters[patchIndex], ...patch },
        ...testFilters.slice(patchIndex + 1),
      ]);
    });

    it('Should suspend a filter', () => {
      const patchIndex = 0;

      reduxStore.dispatch(suspendQueryFilter(testFilters[patchIndex].id));

      expectFilters(selectQueryFilters(reduxStore.getState()), [
        ...testFilters.slice(0, patchIndex),
        { ...testFilters[patchIndex], is_suspended: true },
        ...testFilters.slice(patchIndex + 1),
      ]);
    });

    it('Should delete a filter', () => {
      const patchIndex = 0;

      reduxStore.dispatch(deleteQueryFilter(testFilters[0].id));

      expectFilters(selectQueryFilters(reduxStore.getState()), [
        ...testFilters.slice(0, patchIndex),
        ...testFilters.slice(patchIndex + 1),
      ]);
    });

    describe('When a query filter already exists with the same key', () => {
      beforeEach(() => {
        reduxStore = setupStore({
          ...initialState,
          filters: {
            ...initialState.filters,
            queryFilters: {
              ...initialState.filters.queryFilters,
              queryFilters: testFilters,
            },
          },
        });
      });

      it('Add filter / same key & same value / should replace previous filter', () => {
        const existingIndex = 2; // At which index we are using the same key to create filter
        const filterId = selectQueryFilters(reduxStore.getState())[
          existingIndex
        ].key;
        const existingValue = selectQueryFilters(reduxStore.getState())[
          existingIndex
        ].value;
        const newFilter = QF.createFilter(filterId, existingValue, {
          is_suspended: true,
        });

        reduxStore.dispatch(
          addQueryFilter({
            key: filterId,
            value: existingValue,
            options: {
              is_suspended: true,
            },
          }),
        );

        expectFilters(selectQueryFilters(reduxStore.getState()), [
          ...testFilters.slice(0, existingIndex),
          newFilter,
          ...testFilters.slice(existingIndex + 1),
        ]);
      });

      it('Add filter / same key & different value / should create new filter & suspend the previous filter', () => {
        const existingIndex = 0; // At which index we are using the same key to create filter
        const filterId = selectQueryFilters(reduxStore.getState())[
          existingIndex
        ].key;
        const newFilter = QF.createFilter(filterId, '10.0.0.12', {
          is_suspended: true,
        });

        reduxStore.dispatch(
          addQueryFilter({
            key: filterId,
            value: newFilter.value,
            options: { is_suspended: true },
          }),
        );

        expectFilters(selectQueryFilters(reduxStore.getState()), [
          ...testFilters.slice(0, existingIndex),
          { ...testFilters[existingIndex], is_suspended: true },
          ...testFilters.slice(existingIndex + 1),
          newFilter,
        ]);
      });
    });

    describe('Clearing suspended filters', () => {
      it('Should clear only suspended filters', () => {
        reduxStore.dispatch(suspendQueryFilter(testFilters[0].id));
        reduxStore.dispatch(suspendQueryFilter(testFilters[2].id));
        reduxStore.dispatch(clearSuspendedFilters());

        expectFilters(selectQueryFilters(reduxStore.getState()), [
          testFilters[1], // Only the middle filter (dest_ip) should remain
        ]);
      });

      it('Should not affect state when no filters are suspended', () => {
        reduxStore.dispatch(clearSuspendedFilters());
        expectFilters(selectQueryFilters(reduxStore.getState()), testFilters);
      });

      it('Should clear all filters when all are suspended', () => {
        testFilters.forEach((filter) => {
          reduxStore.dispatch(suspendQueryFilter(filter.id));
        });
        reduxStore.dispatch(clearSuspendedFilters());

        expectFilters(selectQueryFilters(reduxStore.getState()), []);
      });
    });
  });
});

const withoutId = (filters: QueryFilterState[]) =>
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  filters.map(({ id, ...rest }) => rest);

const expectFilters = (
  storeFilters: QueryFilterState[],
  expectedFilters: QueryFilterState[],
) => expect(withoutId(storeFilters)).toEqual(withoutId(expectedFilters));
