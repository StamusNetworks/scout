import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { BeaconingEvent } from '@/features/events/beaconing/common/beaconing-event.model';

import { BeaconingJa3sDetails } from './beaconing-ja3s-details';

const mockBeaconingEvent: BeaconingEvent = {
  timestamp: '2024-01-15T10:00:00Z',
  src_ip: ['10.0.0.1'],
  event_type: 'beaconing',
  stamus_type: 'beaconing',
  tls: {
    sni: ['example.com'],
    ja3s: {
      hash: ['deadbeef1234567890abcdef'],
    },
  },
  beacon_report: {
    outdated: false,
    value: 'deadbeef1234567890abcdef',
    beacon_metric: 0.75,
    assets: ['10.0.0.1'],
    tenant: 1,
    tls_sni: ['example.com'],
    first_seen: '2024-01-10T08:00:00Z',
    last_seen: '2024-01-15T10:00:00Z',
    document_type: 'agg_ja3s_src_only',
    serving_ip: ['203.0.113.42'],
    client_ip: ['10.0.0.1'],
    server_hash: [],
    flags: {
      is_inactive: false,
      well_known_domain: false,
    },
    stats: {
      flow_count: 50,
      traffic_rx_total_bytes: 25000,
      traffic_tx_total_bytes: 15000,
      traffic_avg_bytes: 800,
      traffic_min_bytes: 200,
      traffic_max_bytes: 2000,
      traffic_rx_std_dev_bytes: 150,
      traffic_tx_std_dev_bytes: 100,
      time_delta_avg_seconds: 600,
      time_delta_median_seconds: 590,
    },
    estimate_next_seen: '2024-01-15T10:10:00Z',
    query_timestamp: '2024-01-15T10:01:00Z',
    geoip_serving_ip: {
      country_code: 'DE',
      ip_country: 'Germany',
      asn_code: 'AS3320',
      asn_organization: 'Deutsche Telekom AG',
    },
  },
  tenant: 1,
  dest_ip: ['203.0.113.42'],
  _id: 'event-ja3s-1',
};

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: ['/beaconing/ja3s/deadbeef1234567890abcdef'],
    }),
  });

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/appliances/es_beaconing_events/', () =>
      HttpResponse.json(emptyPaginated),
    ),
    http.get(baseUrl + '/appliances/host_id/', () =>
      HttpResponse.json(emptyPaginated),
    ),
    http.get(baseUrl + '/rules/es/tls_tail/', () =>
      HttpResponse.json(emptyPaginated),
    ),
  );
});

describe('BeaconingJa3sDetails', () => {
  it('renders JA3S hash when data loads', async () => {
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

    await renderWithProviders(
      <BeaconingJa3sDetails ja3s="deadbeef1234567890abcdef" />,
      {
        router: createTestRouter(),
      },
    );

    await waitFor(() => {
      expect(screen.getByText('deadbeef1234567890abcdef')).toBeInTheDocument();
    });
  });

  it('renders empty state when no results', async () => {
    await renderWithProviders(
      <BeaconingJa3sDetails ja3s="deadbeef1234567890abcdef" />,
      {
        router: createTestRouter(),
      },
    );

    await waitFor(() => {
      expect(
        screen.getByText('No beaconing data found for this JA3S.'),
      ).toBeInTheDocument();
    });
  });
});
