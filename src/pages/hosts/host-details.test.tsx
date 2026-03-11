import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { BreadcrumbProvider } from '@/common/design-system/molecules/breadcrumbs';
import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

import { HostDetails } from './[hostId]/index';

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/appliances/entity/*', () =>
      HttpResponse.json(emptyPaginated),
    ),
    http.get('*/api/v2/appliances/threat-status/', () =>
      HttpResponse.json(emptyPaginated),
    ),
    http.get(baseUrl + '/rules/rule/', () => HttpResponse.json(emptyPaginated)),
    http.get(baseUrl + '/appliances/es_beaconing_events/', () =>
      HttpResponse.json(emptyPaginated),
    ),
    http.get(baseUrl + '/appliances/es_discovery_events/', () =>
      HttpResponse.json(emptyPaginated),
    ),
    http.get(baseUrl + '/rules/es/alerts_tail', () =>
      HttpResponse.json(emptyPaginated),
    ),
  );
});

const createTestRouter = (hostId: string) => {
  const rootRoute = createRootRoute();
  const hostsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'hosts/$hostId',
  });
  const routeTree = rootRoute.addChildren([hostsRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: [`/hosts/${hostId}`],
    }),
  });
};

const renderPage = async (hostId: string, multitenancy = false) =>
  renderWithProviders(
    <BreadcrumbProvider>
      <HostDetails />
    </BreadcrumbProvider>,
    {
      router: createTestRouter(hostId),
      preloadedState: {
        ...initialState,
        filters: {
          ...initialState.filters,
          tenancy: {
            ...initialState.filters.tenancy,
            multitenancy,
          },
        },
      },
    },
  );

describe('HostDetails', () => {
  it('shows invalid IP error for non-IP host IDs', async () => {
    await renderPage('not-an-ip');

    expect(screen.getByText('Invalid IP address')).toBeInTheDocument();
    expect(screen.getByText(/not-an-ip/)).toBeInTheDocument();
    expect(screen.getByText('Back to hosts')).toBeInTheDocument();
  });

  it('shows host not found when the host has no host_id', async () => {
    server.use(
      http.get(baseUrl + '/appliances/host_id/:hostId', () =>
        HttpResponse.json({ ip: '10.0.0.1', hits: 0 }),
      ),
    );

    await renderPage('10.0.0.1');

    await waitFor(() => {
      expect(screen.getByText('Host not found')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'This host does not exist. It may have been removed or the IP address is incorrect.',
      ),
    ).toBeInTheDocument();

    expect(screen.getByText('Back to hosts')).toBeInTheDocument();
  });

  it('shows host not found when the API returns 404', async () => {
    server.use(
      http.get(baseUrl + '/appliances/host_id/:hostId', () =>
        HttpResponse.json({ detail: 'Not found' }, { status: 404 }),
      ),
    );

    await renderPage('10.0.0.1');

    await waitFor(() => {
      expect(screen.getByText('Host not found')).toBeInTheDocument();
    });
  });

  it('suggests wrong tenant when multitenant is enabled', async () => {
    server.use(
      http.get(baseUrl + '/appliances/host_id/:hostId', () =>
        HttpResponse.json({ ip: '10.0.0.1', hits: 0 }),
      ),
    );

    await renderPage('10.0.0.1', true);

    await waitFor(() => {
      expect(screen.getByText('Host not found')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'This host does not exist or you may be on the wrong tenant.',
      ),
    ).toBeInTheDocument();
  });
});
