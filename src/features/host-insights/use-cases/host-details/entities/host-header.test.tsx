import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

import { HostHeader } from './host-header';

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

const mockHost = {
  ip: '10.0.0.1',
  hits: 42,
  host_id: {
    ip: '10.0.0.1',
    in_home_net: true,
    first_seen: '2026-01-01T00:00:00Z',
    last_seen: '2026-03-17T00:00:00Z',
    services_count: 3,
    hostname_count: 1,
    username_count: 2,
    roles_count: 1,
    'tls.ja4_count': 1,
    'http.user_agent_count': 2,
    client_service_count: 0,
    net_info_count: 1,
    tenant: 1,
    hostname: [
      {
        host: 'test-host.local',
        first_seen: '2026-01-01T00:00:00Z',
        last_seen: '2026-03-17T00:00:00Z',
      },
    ],
    roles: [
      {
        name: 'dhcp',
        first_seen: '2026-01-01T00:00:00Z',
        last_seen: '2026-03-17T00:00:00Z',
      },
    ],
    username: [
      {
        user: 'admin',
        first_seen: '2026-01-01T00:00:00Z',
        last_seen: '2026-03-17T00:00:00Z',
      },
    ],
    net_info: [
      {
        agg: '10.0.0.0/24',
        first_seen: '2026-01-01T00:00:00Z',
        last_seen: '2026-03-17T00:00:00Z',
      },
    ],
    client_service: [],
  },
};

/** All API handlers needed by HostHeader with customisable host response. */
const allHandlers = (
  hostHandler = http.get(baseUrl + '/appliances/host_id/:hostId', () =>
    HttpResponse.json(mockHost),
  ),
) => [
  hostHandler,
  http.get(baseUrl + '/appliances/threat/threats_per_asset/', () =>
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
];

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: ['/hosts/10.0.0.1'],
    }),
  });

const renderComponent = async (hostId = '10.0.0.1') =>
  renderWithProviders(<HostHeader hostId={hostId} />, {
    router: createTestRouter(),
    preloadedState: { ...initialState },
  });

describe('HostHeader', () => {
  it('shows loading state initially', async () => {
    server.use(
      ...allHandlers(
        http.get(baseUrl + '/appliances/host_id/:hostId', async () => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          return HttpResponse.json(mockHost);
        }),
      ),
    );

    await renderComponent();

    expect(screen.getByTestId('host-header-loading')).toBeInTheDocument();
  });

  it('renders host summary section after data loads', async () => {
    server.use(...allHandlers());

    await renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('host-header')).toBeInTheDocument();
    });

    // Host IP should be visible in the summary
    expect(screen.getByText('10.0.0.1')).toBeInTheDocument();
  });

  it('renders nothing when the host API returns an error', async () => {
    server.use(
      ...allHandlers(
        http.get(baseUrl + '/appliances/host_id/:hostId', () =>
          HttpResponse.json({ detail: 'Not found' }, { status: 404 }),
        ),
      ),
    );

    const { container } = await renderComponent();

    await waitFor(() => {
      expect(
        screen.queryByTestId('host-header-loading'),
      ).not.toBeInTheDocument();
    });

    // Error state renders null
    expect(screen.queryByTestId('host-header')).not.toBeInTheDocument();
    expect(container.textContent).toBe('');
  });

  it('renders nothing when the host has no host_id', async () => {
    server.use(
      ...allHandlers(
        http.get(baseUrl + '/appliances/host_id/:hostId', () =>
          HttpResponse.json({ ip: '10.0.0.1', hits: 0 }),
        ),
      ),
    );

    const { container } = await renderComponent();

    await waitFor(() => {
      expect(
        screen.queryByTestId('host-header-loading'),
      ).not.toBeInTheDocument();
    });

    expect(screen.queryByTestId('host-header')).not.toBeInTheDocument();
    expect(container.textContent).toBe('');
  });

  it('renders host details (hostname, role, network) after data loads', async () => {
    server.use(...allHandlers());

    await renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('host-header')).toBeInTheDocument();
    });

    // HostSummary molecule renders the host stats
    expect(screen.getByText('test-host.local')).toBeInTheDocument();
    expect(screen.getByText('DHCP Server')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('10.0.0.0/24')).toBeInTheDocument();
  });
});
