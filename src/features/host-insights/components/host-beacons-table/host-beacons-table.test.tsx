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

import { HostBeaconsTable } from './host-beacons-table';

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

const mockBeaconingEvent = {
  _id: 'beacon-1',
  timestamp: '2026-03-17T10:00:00Z',
  src_ip: ['192.168.1.100'],
  dest_ip: ['10.0.0.1'],
  event_type: 'beaconing',
  stamus_type: 'beaconing',
  tenant: 1,
  tls: {
    sni: ['example.com'],
    ja3s: { hash: [['abc123']] },
  },
  beacon_report: {
    outdated: false,
    value: '10.0.0.1',
    beacon_metric: 0.95,
    assets: ['192.168.1.100'],
    tenant: 1,
    tls_sni: ['example.com'],
    first_seen: '2026-03-01T00:00:00Z',
    last_seen: '2026-03-17T10:00:00Z',
    document_type: 'agg_serving_ip',
    serving_ip: ['10.0.0.1'],
    client_ip: ['192.168.1.100'],
    server_hash: ['abc123'],
    flags: { is_inactive: false, well_known_domain: false },
    stats: {
      flow_count: 100,
      traffic_rx_total_bytes: 50000,
      traffic_tx_total_bytes: 30000,
      traffic_avg_bytes: 800,
      traffic_min_bytes: 100,
      traffic_max_bytes: 2000,
      traffic_rx_std_dev_bytes: 100,
      traffic_tx_std_dev_bytes: 80,
      time_delta_avg_seconds: 60,
      time_delta_median_seconds: 58,
    },
    estimate_next_seen: '2026-03-17T10:01:00Z',
    query_timestamp: '2026-03-17T10:00:00Z',
    geoip_serving_ip: {
      country_code: 'US',
      ip_country: 'United States',
      asn_code: 'AS12345',
      asn_organization: 'Test ISP',
    },
  },
};

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: ['/hosts/192.168.1.100/beacons'],
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
      <HostBeaconsTable {...props} />
    </BreadcrumbProvider>,
    {
      router: createTestRouter(),
      preloadedState: { ...initialState },
    },
  );
};

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/appliances/es_beaconing_events/', () =>
      HttpResponse.json(emptyPaginated),
    ),
  );
});

describe('HostBeaconsTable', () => {
  it('renders table with mock beaconing data', async () => {
    server.use(
      http.get(baseUrl + '/appliances/es_beaconing_events/', () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [mockBeaconingEvent],
        }),
      ),
    );

    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('10.0.0.1')).toBeInTheDocument();
    });

    expect(screen.getByText('95')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
  });

  it('renders empty state when no results', async () => {
    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('No beacons found')).toBeInTheDocument();
    });
  });
});
