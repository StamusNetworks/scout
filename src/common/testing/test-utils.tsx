import type { AnyRouter } from '@tanstack/react-router';
import { RouterProvider } from '@tanstack/react-router';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { PropsWithChildren, type ReactElement } from 'react';
import { Provider } from 'react-redux';

import { QueryFilterState } from '@/features/filtering/filters/query-filters/query-filter.model';
import { AppStore, RootState, setupStore } from '@/store/store';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
  router?: AnyRouter;
}

export async function renderWithProviders(
  ui: ReactElement,
  extendedRenderOptions: ExtendedRenderOptions = {},
) {
  const {
    preloadedState = {},
    store = setupStore(preloadedState),
    router,
    ...renderOptions
  } = extendedRenderOptions;

  if (router) {
    // Inject test UI as the router's defaultComponent.
    // Routes without their own component will render this.
    router.options.defaultComponent = () => <>{ui}</>;

    // Pre-load the router so RouterProvider renders synchronously
    await router.load();

    return {
      store,
      ...render(
        <NuqsTestingAdapter>
          <Provider store={store}>
            <RouterProvider router={router} />
          </Provider>
        </NuqsTestingAdapter>,
        renderOptions,
      ),
    };
  }

  const Wrapper = ({ children }: PropsWithChildren) => (
    <NuqsTestingAdapter>
      <Provider store={store}>{children}</Provider>
    </NuqsTestingAdapter>
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
