import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { SidebarProvider } from '@/common/design-system/atoms/ui/sidebar';
import { BreadcrumbProvider } from '@/common/design-system/molecules/breadcrumbs';
import { renderWithProviders } from '@/common/testing/test-utils';
import * as ThreatsAPI from '@/features/hunt/threats/api/threats.api';
import * as NewsAPI from '@/features/marketing/api/news.api';
import { API } from '@/store/api';
import * as AppStore from '@/store/store';
import { initialState } from '@/store/store.init';

import { Header } from './header';

function createTestRouter() {
  const rootRoute = createRootRoute({
    component: () => (
      <SidebarProvider>
        <BreadcrumbProvider>
          <Header />
        </BreadcrumbProvider>
      </SidebarProvider>
    ),
  });
  return createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
}

describe('Header', () => {
  beforeEach(() => {
    // Mock the news API queries to prevent them from running during tests
    vi.spyOn(NewsAPI, 'useGetEENewsFeedQuery').mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    } as any);
    vi.spyOn(NewsAPI, 'useGetCENewsFeedQuery').mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    } as any);
  });

  test('Should dispatch the API reload', async () => {
    const dispatch = vi.fn();
    vi.spyOn(AppStore, 'useAppDispatch').mockReturnValue(dispatch);
    const router = createTestRouter();
    await router.load();
    renderWithProviders(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId('reload-button')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('reload-button'));

    expect(dispatch).toHaveBeenCalledWith(API.util.invalidateTags(['Reload']));
  });
  test('Should pre fetch the threats', async () => {
    const useGetThreatsQuery = vi.spyOn(ThreatsAPI, 'useGetSTIThreatsQuery');
    const router = createTestRouter();
    await router.load();
    renderWithProviders(<RouterProvider router={router} />, {
      preloadedState: {
        ...initialState,
        filters: {
          ...initialState.filters,
          tenancy: {
            ...initialState.filters.tenancy,
            multitenancy: true,
            tenant: 4,
          },
        },
      },
    });

    await waitFor(() => {
      expect(useGetThreatsQuery).toHaveBeenCalled();
    });
  });
});
