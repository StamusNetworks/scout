import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { BreadcrumbProvider } from '@/common/design-system/molecules/breadcrumbs';
import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

import { HostsTable } from './hosts-table';

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

const mockHost = {
  ip: '192.168.1.100',
  host_id: {
    hostname_count: 1,
    'http.user_agent_count': 0,
    roles_count: 1,
    'tls.ja4_count': 0,
    services_count: 2,
    client_service_count: 0,
    username_count: 1,
    first_seen: '2026-01-01T00:00:00Z',
    last_seen: '2026-03-17T10:00:00Z',
    client_service: [],
    net_info: [
      {
        agg: '192.168.1.0/24',
        first_seen: '2026-01-01T00:00:00Z',
        last_seen: '2026-03-17T10:00:00Z',
      },
    ],
    hostname: [
      {
        host: 'workstation-01.local',
        first_seen: '2026-01-01T00:00:00Z',
        last_seen: '2026-03-17T10:00:00Z',
      },
    ],
    username: [
      {
        user: 'admin',
        first_seen: '2026-01-01T00:00:00Z',
        last_seen: '2026-03-17T10:00:00Z',
      },
    ],
    roles: [
      {
        name: 'dhcp',
        first_seen: '2026-01-01T00:00:00Z',
        last_seen: '2026-03-17T10:00:00Z',
      },
    ],
    services: [],
    net_info_count: 1,
    tenant: 1,
    in_home_net: true,
  },
  hits: 15,
};

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: ['/hosts'],
    }),
  });

const defaultProps = {
  page: 1,
  pageSize: 10,
  sorting: [{ id: 'hits', desc: true }],
  withAlerts: true,
  inHomeNet: 'all' as const,
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
  onSortingChange: vi.fn(),
  onWithAlertsChange: vi.fn(),
  onInHomeNetChange: vi.fn(),
  onRowClick: vi.fn(),
};

const renderTable = async (overrides?: Partial<typeof defaultProps>) => {
  const props = { ...defaultProps, ...overrides };
  return renderWithProviders(
    <BreadcrumbProvider>
      <HostsTable {...props} />
    </BreadcrumbProvider>,
    {
      router: createTestRouter(),
      preloadedState: { ...initialState },
    },
  );
};

beforeEach(() => {
  // Default: return empty for host queries and aggregations
  server.use(
    http.get(baseUrl + '/appliances/host_id_alerts/', () =>
      HttpResponse.json(emptyPaginated),
    ),
    http.get(baseUrl + '/appliances/host_id/', () =>
      HttpResponse.json(emptyPaginated),
    ),
    http.post(baseUrl + '/rules/es/search/', () =>
      HttpResponse.json({
        took: 1,
        timed_out: false,
        _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
        hits: {
          total: { value: 0, relation: 'eq' },
          max_score: null,
          hits: [],
        },
        aggregations: {
          roles: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [],
          },
          services: {
            buckets: {
              '0.0-1.0': { from: 0, to: 1, doc_count: 0 },
              '1.0-*': { from: 1, doc_count: 0 },
            },
          },
        },
      }),
    ),
  );
});

describe('HostsTable', () => {
  it('renders table with mock host data', async () => {
    server.use(
      http.get(baseUrl + '/appliances/host_id_alerts/', () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [mockHost],
        }),
      ),
    );

    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
    });

    expect(screen.getByText('workstation-01.local')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders empty state when no results', async () => {
    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('No hosts found')).toBeInTheDocument();
    });
  });
});
