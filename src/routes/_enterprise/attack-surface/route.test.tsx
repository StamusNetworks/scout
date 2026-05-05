import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { BreadcrumbProvider } from '@/common/design-system/molecules/breadcrumbs';
import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { HomeNetPicker } from '@/features/host-insights/components/home-net-picker/home-net-picker';

const emptyAggregation = {
  aggregations: {
    services: { buckets: {} },
    roles: { buckets: [] },
  },
};

beforeEach(() => {
  server.use(
    http.post(baseUrl + '/rules/es/search/', () =>
      HttpResponse.json(emptyAggregation),
    ),
  );
});

const layoutSearchSchema = z.object({
  in_home_net: z.enum(['true', 'false', 'all']).default('all'),
});

const inventorySearchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().optional(),
});

type Search = {
  in_home_net?: 'true' | 'false' | 'all';
  page?: number;
  page_size?: number;
  sort?: string;
};

// Mirrors the picker handler from src/routes/_enterprise/attack-surface/route.tsx.
// Kept in sync deliberately: this harness is the smallest unit that lets us
// assert the URL state after clicking the picker, including the `page: 1`
// reset that prevents stranding the inventory child on an empty page.
const PickerHarness = () => {
  const search = useSearch({ strict: false }) as Search;
  const navigate = useNavigate();
  return (
    <HomeNetPicker
      value={search.in_home_net ?? 'all'}
      onChange={(v) =>
        void navigate({
          search: ((prev: Record<string, unknown>) => ({
            ...prev,
            in_home_net: v,
            page: 1,
          })) as never,
        })
      }
    />
  );
};

const createTestRouter = (initialPath: string) => {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const layoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'attack-surface',
    validateSearch: layoutSearchSchema,
    component: PickerHarness,
  });
  const inventoryRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: 'inventory',
    validateSearch: inventorySearchSchema,
  });
  const indexRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: '/',
  });
  rootRoute.addChildren([
    layoutRoute.addChildren([indexRoute, inventoryRoute]),
  ]);
  return createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
};

const renderHarness = async (initialPath: string) => {
  const router = createTestRouter(initialPath);
  const result = await renderWithProviders(
    <BreadcrumbProvider>
      <></>
    </BreadcrumbProvider>,
    { router },
  );
  return { ...result, router };
};

describe('Attack Surface route — picker handler', () => {
  it('writes the new in_home_net value to the URL when External is clicked', async () => {
    const user = userEvent.setup();
    const { router } = await renderHarness('/attack-surface');

    await user.click(screen.getByRole('tab', { name: 'External' }));

    await waitFor(() => {
      expect(router.state.location.search).toEqual(
        expect.objectContaining({ in_home_net: 'false' }),
      );
    });
  });

  it('resets page to 1 when picker changes from inventory page=2', async () => {
    const user = userEvent.setup();
    const { router } = await renderHarness(
      '/attack-surface/inventory?page=2&page_size=10',
    );

    await user.click(screen.getByRole('tab', { name: 'External' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/attack-surface/inventory');
      expect(router.state.location.search).toEqual(
        expect.objectContaining({ in_home_net: 'false', page: 1 }),
      );
    });
  });
});
