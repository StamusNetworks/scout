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

import { HostSightingsTable } from './host-sightings-table';

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

const mockSightingEvent = {
  _id: 'sighting-1',
  '@timestamp': '2026-03-17T10:00:00Z',
  timestamp: '2026-03-17T10:00:00Z',
  event_type: 'discovery',
  app_proto: 'tls',
  src_ip: '192.168.1.100',
  src_port: 443,
  dest_ip: '10.0.0.1',
  dest_port: 12345,
  host: 'probe-1',
  discovery: {
    asset: '192.168.1.100',
    asset_role: ['domain controller'],
    key: 'tls.subject',
    value: 'CN=example.com',
  },
};

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: ['/hosts/192.168.1.100/sightings'],
    }),
  });

const defaultProps = {
  hostId: '192.168.1.100',
  page: 1,
  pageSize: 10,
  sorting: [],
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
  onSortingChange: vi.fn(),
};

const renderTable = async (overrides?: Partial<typeof defaultProps>) => {
  const props = { ...defaultProps, ...overrides };
  return renderWithProviders(
    <BreadcrumbProvider>
      <HostSightingsTable {...props} />
    </BreadcrumbProvider>,
    {
      router: createTestRouter(),
      preloadedState: { ...initialState },
    },
  );
};

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/appliances/es_discovery_events/', () =>
      HttpResponse.json(emptyPaginated),
    ),
  );
});

describe('HostSightingsTable', () => {
  it('renders table with mock sighting data', async () => {
    server.use(
      http.get(baseUrl + '/appliances/es_discovery_events/', () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [mockSightingEvent],
        }),
      ),
    );

    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('CN=example.com')).toBeInTheDocument();
    });

    expect(screen.getByText('tls')).toBeInTheDocument();
    expect(screen.getByText('tls.subject')).toBeInTheDocument();
  });

  it('renders empty state when no results', async () => {
    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('No sightings found')).toBeInTheDocument();
    });
  });
});
