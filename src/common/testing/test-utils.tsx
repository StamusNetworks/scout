import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import { PropsWithChildren, type ReactElement } from 'react';
import { Provider } from 'react-redux';

import { QueryFilterState } from '@/features/hunt/filtering/query-filters/model/query-filter';
import { AppStore, RootState, setupStore } from '@/store/store';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

export function renderWithProviders(
  ui: ReactElement,
  extendedRenderOptions: ExtendedRenderOptions = {},
) {
  const {
    preloadedState = {},
    store = setupStore(preloadedState),
    ...renderOptions
  } = extendedRenderOptions;

  const Wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );

  // Return an object with the store and all of RTL's query functions
  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export const withoutId = ({ id, ...rest }: QueryFilterState) => rest;
export const withoutIds = (filters: QueryFilterState[]) =>
  filters.map(withoutId);
export const expectFiltersWithoutId = (store: AppStore) =>
  expect(store.getState().filters.queryFilters.queryFilters.map(withoutId));
