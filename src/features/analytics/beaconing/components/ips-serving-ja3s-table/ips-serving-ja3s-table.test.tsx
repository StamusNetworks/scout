import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { routeTree } from '@/routeTree.gen';

const createTestRouter = () =>
  createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
import { vi } from 'vitest';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';

import { BeaconingEvent } from '../../models/beaconing-event.model';
import { IpsServingJa3sTable } from './ips-serving-ja3s-table';

// Mock data for testing different JA3S hash values
const mockBeaconingEventsData1: Partial<BeaconingEvent>[] = [
  {
    _id: 'event1',
    timestamp: '2023-01-01T00:00:00Z',
    src_ip: ['192.168.1.10', '192.168.1.11'],
    event_type: 'tls',
    stamus_type: 'agg_serving_ip',
    tls: {
      sni: ['example.com'],
      ja3s: {
        hash: [['ja3s-hash-123']],
      },
    },
    beacon_report: {
      outdated: false,
      value: '8.8.8.8',
      beacon_metric: 0.9,
      assets: ['asset1', 'asset2', 'asset3'],
      tenant: 1,
      tls_sni: ['example.com', 'other.com'],
      first_seen: '2023-01-01T00:00:00Z',
      last_seen: '2023-01-02T00:00:00Z',
      document_type: 'agg_serving_ip',
      serving_ip: ['8.8.8.8'],
      client_ip: ['192.168.1.10', '192.168.1.11'],
      server_hash: ['ja3s-hash-123'],
      flags: {
        is_inactive: false,
        well_known_domain: true,
      },
      stats: {
        flow_count: 10,
        traffic_rx_total_bytes: 1000,
        traffic_tx_total_bytes: 2000,
        traffic_avg_bytes: 300,
        traffic_min_bytes: 100,
        traffic_max_bytes: 500,
        traffic_rx_std_dev_bytes: 50,
        traffic_tx_std_dev_bytes: 60,
        time_delta_avg_seconds: 120,
        time_delta_median_seconds: 110,
      },
      estimate_next_seen: '2023-01-03T00:00:00Z',
      query_timestamp: '2023-01-02T12:00:00Z',
      geoip_serving_ip: {
        country_code: 'US',
        ip_country: 'United States',
        asn_code: 'AS15169',
        asn_organization: 'Google LLC',
      },
    },
    tenant: 1,
    dest_ip: ['8.8.8.8'],
  },
  {
    _id: 'event2',
    timestamp: '2023-01-01T00:00:00Z',
    src_ip: ['192.168.1.12'],
    event_type: 'tls',
    stamus_type: 'agg_serving_ip',
    tls: {
      sni: ['example.org'],
      ja3s: {
        hash: [['ja3s-hash-123']],
      },
    },
    beacon_report: {
      outdated: false,
      value: '8.8.4.4',
      beacon_metric: 0.8,
      assets: ['asset4', 'asset5'],
      tenant: 1,
      tls_sni: ['example.org'],
      first_seen: '2023-01-01T00:00:00Z',
      last_seen: '2023-01-02T00:00:00Z',
      document_type: 'agg_serving_ip',
      serving_ip: ['8.8.4.4'],
      client_ip: ['192.168.1.12'],
      server_hash: ['ja3s-hash-123'],
      flags: {
        is_inactive: false,
        well_known_domain: true,
      },
      stats: {
        flow_count: 5,
        traffic_rx_total_bytes: 500,
        traffic_tx_total_bytes: 1000,
        traffic_avg_bytes: 150,
        traffic_min_bytes: 50,
        traffic_max_bytes: 250,
        traffic_rx_std_dev_bytes: 25,
        traffic_tx_std_dev_bytes: 30,
        time_delta_avg_seconds: 60,
        time_delta_median_seconds: 55,
      },
      estimate_next_seen: '2023-01-03T00:00:00Z',
      query_timestamp: '2023-01-02T12:00:00Z',
      geoip_serving_ip: {
        country_code: 'US',
        ip_country: 'United States',
        asn_code: 'AS15169',
        asn_organization: 'Google LLC',
      },
    },
    tenant: 1,
    dest_ip: ['8.8.4.4'],
  },
];

const mockBeaconingEventsData2: Partial<BeaconingEvent>[] = [
  {
    _id: 'event3',
    timestamp: '2023-01-01T00:00:00Z',
    src_ip: ['192.168.1.13'],
    event_type: 'tls',
    stamus_type: 'agg_serving_ip',
    tls: {
      sni: ['example.net'],
      ja3s: {
        hash: [['ja3s-hash-456']],
      },
    },
    beacon_report: {
      outdated: false,
      value: '1.1.1.1',
      beacon_metric: 0.95,
      assets: ['asset6', 'asset7', 'asset8', 'asset9'],
      tenant: 1,
      tls_sni: ['example.net'],
      first_seen: '2023-01-01T00:00:00Z',
      last_seen: '2023-01-02T00:00:00Z',
      document_type: 'agg_serving_ip',
      serving_ip: ['1.1.1.1'],
      client_ip: ['192.168.1.13'],
      server_hash: ['ja3s-hash-456'],
      flags: {
        is_inactive: false,
        well_known_domain: true,
      },
      stats: {
        flow_count: 3,
        traffic_rx_total_bytes: 300,
        traffic_tx_total_bytes: 600,
        traffic_avg_bytes: 100,
        traffic_min_bytes: 50,
        traffic_max_bytes: 150,
        traffic_rx_std_dev_bytes: 15,
        traffic_tx_std_dev_bytes: 20,
        time_delta_avg_seconds: 30,
        time_delta_median_seconds: 25,
      },
      estimate_next_seen: '2023-01-03T00:00:00Z',
      query_timestamp: '2023-01-02T12:00:00Z',
      geoip_serving_ip: {
        country_code: 'AU',
        ip_country: 'Australia',
        asn_code: 'AS13335',
        asn_organization: 'Cloudflare, Inc.',
      },
    },
    tenant: 1,
    dest_ip: ['1.1.1.1'],
  },
];

// Mock the ExternalLink component for VirusTotal since we don't need to test actual links
vi.mock('@/common/design-system/atoms/external-link', () => ({
  ExternalLink: ({ to }: { to: string }) => (
    <div
      data-testid="external-link"
      data-to={to}
    >
      VirusTotal Link
    </div>
  ),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('IpsServingJa3sTable', () => {
  beforeEach(() => {
    // Set up MSW handlers to mock API responses
    server.use(
      http.get(baseUrl + '/appliances/es_beaconing_events/', ({ request }) => {
        const url = new URL(request.url);
        const qfilter = url.searchParams.get('qfilter') || '';

        if (qfilter.includes('ja3s\\-hash\\-123')) {
          return HttpResponse.json({
            count: mockBeaconingEventsData1.length,
            next: null,
            previous: null,
            results: mockBeaconingEventsData1,
          });
        } else if (qfilter.includes('ja3s\\-hash\\-456')) {
          return HttpResponse.json({
            count: mockBeaconingEventsData2.length,
            next: null,
            previous: null,
            results: mockBeaconingEventsData2,
          });
        }

        return HttpResponse.json({
          count: 0,
          next: null,
          previous: null,
          results: [],
        });
      }),
    );
  });

  test('should render loading state when fetching data', async () => {
    renderWithProviders(<IpsServingJa3sTable ja3s="ja3s-hash-123" />, {
      router: createTestRouter(),
    });

    // Verify loading state shows skeleton elements
    expect(screen.getAllByTestId(/skeleton/i).length).toBeGreaterThan(0);
  });

  test('should render IP data with ja3s-hash-123 after loading', async () => {
    renderWithProviders(<IpsServingJa3sTable ja3s="ja3s-hash-123" />, {
      router: createTestRouter(),
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryAllByTestId(/skeleton/i).length).toBe(0);
    });

    // Verify IP addresses are rendered correctly in the IP column
    expect(screen.getByText('8.8.8.8')).toBeInTheDocument();
    expect(screen.getByText('8.8.4.4')).toBeInTheDocument();

    // Verify country information is rendered correctly
    expect(screen.getAllByText('United States').length).toBe(2);

    // Verify ASN codes are rendered correctly
    expect(screen.getAllByText('AS15169').length).toBe(2);

    // Verify ASN organization names are rendered correctly
    expect(screen.getAllByText('Google LLC').length).toBe(2);

    // Verify assets counts are rendered correctly
    expect(screen.getByText('3')).toBeInTheDocument(); // For 8.8.8.8 with 3 assets
    expect(screen.getByText('2')).toBeInTheDocument(); // For 8.8.4.4 with 2 assets

    // Verify VirusTotal links are rendered correctly
    const virustotalLinks = screen.getAllByTestId('external-link');
    expect(virustotalLinks.length).toBe(2);
    expect(virustotalLinks[0].getAttribute('data-to')).toBe(
      'https://www.virustotal.com/gui/ip-address/8.8.8.8',
    );
    expect(virustotalLinks[1].getAttribute('data-to')).toBe(
      'https://www.virustotal.com/gui/ip-address/8.8.4.4',
    );
  });

  test('should render IP data with ja3s-hash-456 after loading', async () => {
    renderWithProviders(<IpsServingJa3sTable ja3s="ja3s-hash-456" />, {
      router: createTestRouter(),
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryAllByTestId(/skeleton/i).length).toBe(0);
    });

    // Verify IP address is rendered correctly
    expect(screen.getByText('1.1.1.1')).toBeInTheDocument();

    // Verify country information is rendered correctly
    expect(screen.getByText('Australia')).toBeInTheDocument();

    // Verify ASN code is rendered correctly
    expect(screen.getByText('AS13335')).toBeInTheDocument();

    // Verify ASN organization name is rendered correctly
    expect(screen.getByText('Cloudflare, Inc.')).toBeInTheDocument();

    // Verify assets count is rendered correctly
    expect(screen.getByText('1')).toBeInTheDocument(); // For 1.1.1.1 with 1 asset

    // Verify VirusTotal link is rendered correctly
    const virustotalLink = screen.getByTestId('external-link');
    expect(virustotalLink.getAttribute('data-to')).toBe(
      'https://www.virustotal.com/gui/ip-address/1.1.1.1',
    );
  });

  test('should handle empty results', async () => {
    renderWithProviders(<IpsServingJa3sTable ja3s="non-existent-hash" />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryAllByTestId(/skeleton/i).length).toBe(0);
    });

    // Verify "No results" message is displayed
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  test('should handle undefined or empty ja3s hash gracefully', async () => {
    renderWithProviders(<IpsServingJa3sTable ja3s="" />);

    // Wait for data loading attempt to complete
    await waitFor(() => {
      expect(screen.queryAllByTestId(/skeleton/i).length).toBe(0);
    });

    // Verify component handles empty ja3s hash gracefully
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  test('should handle API error gracefully', async () => {
    // Override the handler to simulate an API error
    server.use(
      http.get(baseUrl + '/appliances/es_beaconing_events/', () => {
        return HttpResponse.error();
      }),
    );

    renderWithProviders(<IpsServingJa3sTable ja3s="ja3s-hash-123" />);

    // Wait for error handling to complete
    await waitFor(() => {
      expect(screen.queryAllByTestId(/skeleton/i).length).toBe(0);
    });

    // Verify "No results" message is displayed
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });
});
