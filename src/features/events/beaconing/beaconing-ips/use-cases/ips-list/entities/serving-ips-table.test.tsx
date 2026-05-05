import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { BeaconingEvent } from '@/features/events/model/beaconing-event';

import { ServingIpsTable } from './serving-ips-table';

const mockBeaconingEvent: BeaconingEvent = {
  timestamp: '2024-01-15T10:00:00Z',
  src_ip: ['10.0.0.1'],
  event_type: 'beaconing',
  stamus_type: 'beaconing',
  tls: {
    sni: ['example.com'],
    ja3s: {
      hash: ['abc123'],
    },
  },
  beacon_report: {
    outdated: false,
    value: '203.0.113.42',
    beacon_metric: 0.87,
    assets: ['10.0.0.1'],
    tenant: 1,
    tls_sni: ['example.com'],
    first_seen: '2024-01-10T08:00:00Z',
    last_seen: '2024-01-15T10:00:00Z',
    document_type: 'agg_serving_ip',
    serving_ip: [],
    client_ip: ['10.0.0.1'],
    server_hash: [],
    flags: {
      is_inactive: false,
      well_known_domain: false,
    },
    stats: {
      flow_count: 100,
      traffic_rx_total_bytes: 50000,
      traffic_tx_total_bytes: 30000,
      traffic_avg_bytes: 800,
      traffic_min_bytes: 200,
      traffic_max_bytes: 2000,
      traffic_rx_std_dev_bytes: 150,
      traffic_tx_std_dev_bytes: 100,
      time_delta_avg_seconds: 300,
      time_delta_median_seconds: 295,
    },
    estimate_next_seen: '2024-01-15T10:05:00Z',
    query_timestamp: '2024-01-15T10:01:00Z',
    geoip_serving_ip: {
      country_code: 'US',
      ip_country: 'United States',
      asn_code: 'AS15169',
      asn_organization: 'Google LLC',
    },
  },
  tenant: 1,
  dest_ip: ['203.0.113.42'],
  _id: 'event-1',
};

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/beaconing/ips'] }),
  });

const defaultProps = {
  page: 1,
  pageSize: 10,
  sorting: [{ id: 'beacon_report.beacon_metric', desc: true }],
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
  onSortingChange: vi.fn(),
  onRowClick: vi.fn(),
};

const renderTable = async (overrides?: Partial<typeof defaultProps>) => {
  const props = { ...defaultProps, ...overrides };
  return renderWithProviders(<ServingIpsTable {...props} />, {
    router: createTestRouter(),
  });
};

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/appliances/es_beaconing_events/', () =>
      HttpResponse.json(emptyPaginated),
    ),
  );
});

describe('ServingIpsTable', () => {
  it('renders table with mock beaconing event data', async () => {
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
      expect(screen.getByText('203.0.113.42')).toBeInTheDocument();
    });

    expect(screen.getByText('United States')).toBeInTheDocument();
  });

  it('renders empty state when no results', async () => {
    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('No beaconing IPs found')).toBeInTheDocument();
    });
  });
});
