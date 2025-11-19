import { describe, expect, it } from 'vitest';

import { setupStore } from '@/store/store';
import { initialState } from '@/store/store.init';

import { selectFilterCommand } from './add-qfilter-command.selectors';
import {
  addQfilterCommandInitialState,
  AddQfilterCommandState,
  resetStep,
  setFilter,
  setNegated,
  setSearch,
  setValue,
} from './add-qfilter-command.slice';

const initializeTest = (state: Partial<AddQfilterCommandState> = {}) => ({
  store: setupStore({
    ...initialState,
    modals: {
      ...initialState.modals,
      addFiltersCommand: { ...addQfilterCommandInitialState, ...state },
    },
  }),
});

describe('Add QFilter Command', () => {
  it('should set search key', () => {
    const { store } = initializeTest();
    store.dispatch(setSearch('test'));
    expect(selectFilterCommand(store.getState()).search).toBe('test');
  });
  it('should set filter', () => {
    const { store } = initializeTest();
    store.dispatch(setFilter('src_ip'));
    expect(selectFilterCommand(store.getState()).filter).toBe('src_ip');
    expect(selectFilterCommand(store.getState()).step).toBe(1);
  });
  it('should set negated true', () => {
    const { store } = initializeTest({
      step: 1,
    });
    store.dispatch(setNegated(true));
    expect(selectFilterCommand(store.getState()).negated).toBe(true);
    expect(selectFilterCommand(store.getState()).step).toBe(2);
  });
  it('should set negated false', () => {
    const { store } = initializeTest({
      step: 1,
    });
    store.dispatch(setNegated(false));
    expect(selectFilterCommand(store.getState()).negated).toBe(false);
    expect(selectFilterCommand(store.getState()).step).toBe(2);
  });
  it('should set value', () => {
    const { store } = initializeTest({
      filter: 'src_ip',
      step: 2,
      negated: true,
    });
    store.dispatch(setValue('10.0.0.1'));
    expect(selectFilterCommand(store.getState()).value).toBe('10.0.0.1');
    expect(selectFilterCommand(store.getState()).step).toBe(3);
  });
  it('should reset step', () => {
    const { store } = initializeTest({
      filter: 'src_ip',
      step: 3,
      negated: true,
      value: '10.0.0.1',
    });
    store.dispatch(resetStep());
    expect(selectFilterCommand(store.getState()).step).toBe(2);
  });
});
