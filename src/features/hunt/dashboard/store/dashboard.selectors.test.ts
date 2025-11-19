import { describe, expect, test } from 'vitest';

import { RootState } from '@/store/store';
import { initialState } from '@/store/store.init';

import {
  selectCanPanelMoveDown,
  selectCanPanelMoveUp,
  selectIsPanelCollapsed,
} from './dashboard.selectors';
import { DashboardState } from './dashboard.slice';

const baseState: DashboardState = {
  panelsOrdering: [],
  collapsedPanels: [],
  ordering: 'ascending',
  chartTarget: false,
  pageSize: 5,
  hideEmptyPanels: false,
  disabledKeys: [],
};

const initializeStoreState = (state: DashboardState): RootState => ({
  ...initialState,
  pages: {
    ...initialState.pages,
    explorer: {
      ...baseState,
      ...state,
    },
  },
});

describe('Dashboard panel selectors', () => {
  describe('Can the panel move up ?', () => {
    test('Should return false if the panel is the first one', () => {
      const state = initializeStoreState({
        ...baseState,
        panelsOrdering: ['basic', 'dns'],
      });
      const canMoveUp = selectCanPanelMoveUp('basic')(state);
      expect(canMoveUp).toBe(false);
    });
    test('Should return true if the panel is not the first one', () => {
      const state = initializeStoreState({
        ...baseState,
        panelsOrdering: ['dns', 'basic'],
      });
      const canMoveUp = selectCanPanelMoveUp('basic')(state);
      expect(canMoveUp).toBe(true);
    });
  });
  describe('Can the panel move down ?', () => {
    test('Should return true if the panel is not the last one', () => {
      const state = initializeStoreState({
        ...baseState,
        panelsOrdering: ['dns', 'basic'],
      });
      const canMoveDown = selectCanPanelMoveDown('dns')(state);
      expect(canMoveDown).toBe(true);
    });
    test('Should return false if the panel is the last one', () => {
      const state = initializeStoreState({
        ...baseState,
        panelsOrdering: ['dns', 'basic'],
      });
      const canMoveDown = selectCanPanelMoveDown('basic')(state);
      expect(canMoveDown).toBe(false);
    });
  });
  describe('Is the panel collapsed ?', () => {
    test('Should return true if the panel is collapsed', () => {
      const state = initializeStoreState({
        ...baseState,
        collapsedPanels: ['basic'],
      });
      const isCollapsed = selectIsPanelCollapsed('basic')(state);
      expect(isCollapsed).toBe(true);
    });
    test('Should return false if the panel is not collapsed', () => {
      const state = initializeStoreState(baseState);
      const isCollapsed = selectIsPanelCollapsed('basic')(state);
      expect(isCollapsed).toBe(false);
    });
  });
});
