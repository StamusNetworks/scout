import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { ReportSummary } from '@/features/events/beaconing/common/molecules/report-summary';
import {
  beaconingColumns,
  JA3SColumns,
} from '@/features/events/beaconing/common/molecules/report-summary';
import { BeaconingEvent } from '@/features/events/model/beaconing-event';

const mockJA3SReportResponse: Partial<BeaconingEvent>[] = [
  {
    _id: '1',
    beacon_report: {
      outdated: false,
      value: 'ja3s-hash-123',
      beacon_metric: 0.9,
      assets: ['asset1', 'asset2'],
      tenant: 1,
      tls_sni: ['domain1.com', 'domain2.com'],
      first_seen: '2023-01-01T00:00:00Z',
      last_seen: '2023-01-02T00:00:00Z',
      document_type: 'agg_ja3s_src_only',
      serving_ip: ['192.168.1.1'],
      client_ip: ['192.168.1.2', '192.168.1.3'],
      server_hash: ['hash1', 'hash2'],
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
        asn_code: 'AS123',
        asn_organization: 'Test Org',
      },
    },
  },
];

const mockIPReportResponse: Partial<BeaconingEvent>[] = [
  {
    _id: '2',
    beacon_report: {
      outdated: false,
      value: '8.8.8.8',
      beacon_metric: 0.8,
      assets: ['asset3', 'asset4', 'asset5'],
      tenant: 1,
      tls_sni: ['domain3.com', 'domain4.com'],
      first_seen: '2023-02-01T00:00:00Z',
      last_seen: '2023-02-02T00:00:00Z',
      document_type: 'agg_serving_ip',
      serving_ip: ['8.8.8.8'],
      client_ip: ['192.168.2.2', '192.168.2.3'],
      server_hash: ['hash3', 'hash4'],
      flags: {
        is_inactive: false,
        well_known_domain: true,
      },
      stats: {
        flow_count: 20,
        traffic_rx_total_bytes: 2000,
        traffic_tx_total_bytes: 3000,
        traffic_avg_bytes: 400,
        traffic_min_bytes: 200,
        traffic_max_bytes: 600,
        traffic_rx_std_dev_bytes: 70,
        traffic_tx_std_dev_bytes: 80,
        time_delta_avg_seconds: 130,
        time_delta_median_seconds: 120,
      },
      estimate_next_seen: '2023-02-03T00:00:00Z',
      query_timestamp: '2023-02-02T12:00:00Z',
      geoip_serving_ip: {
        country_code: 'CA',
        ip_country: 'Canada',
        asn_code: 'AS456',
        asn_organization: 'Test Org 2',
      },
    },
  },
];

afterEach(() => {
  vi.clearAllMocks();
});

describe('ReportSummary', () => {
  beforeEach(() => {
    server.use(
      http.get(baseUrl + '/appliances/es_beaconing_events/', ({ request }) => {
        const url = new URL(request.url);
        const qfilter = url.searchParams.get('qfilter') || '';
        if (qfilter.includes('agg_ja3s_src_only')) {
          return HttpResponse.json({
            count: mockJA3SReportResponse.length,
            next: null,
            previous: null,
            results: mockJA3SReportResponse,
          });
        } else if (qfilter.includes('agg_serving_ip')) {
          return HttpResponse.json({
            count: mockIPReportResponse.length,
            next: null,
            previous: null,
            results: mockIPReportResponse,
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

  test('should render loading state for JA3S report type', async () => {
    renderWithProviders(
      <ReportSummary
        type="ja3s"
        value="ja3s-hash-123"
      />,
    );
    // In loading state, we should see skeleton elements
    expect(screen.getAllByTestId(/skeleton/i).length).toEqual(
      beaconingColumns.length + JA3SColumns.length,
    );
  });

  test('should render JA3S report data after loading', async () => {
    renderWithProviders(
      <ReportSummary
        type="ja3s"
        value="ja3s-hash-123"
      />,
    );

    // Wait for data to load and check that skeletons are no longer displayed
    await waitFor(() => {
      expect(screen.queryAllByTestId(/skeleton/i).length).toBe(0);
    });

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('1.0 kB')).toBeInTheDocument();
    expect(screen.getByText('2.0 kB')).toBeInTheDocument();
    expect(screen.getByText('300 B')).toBeInTheDocument();
    expect(screen.getByText('100 B')).toBeInTheDocument();
    expect(screen.getByText('500 B')).toBeInTheDocument();
    expect(screen.getByText('110 B')).toBeInTheDocument();
  });

  test('should render loading state for IP report type', async () => {
    renderWithProviders(
      <ReportSummary
        type="ip"
        value="8.8.8.8"
      />,
    );

    // In loading state, we should see skeleton elements
    expect(screen.getAllByTestId(/skeleton/i).length).toBeGreaterThan(0);
  });

  test('should render IP report data after loading', async () => {
    renderWithProviders(
      <ReportSummary
        type="ip"
        value="8.8.8.8"
      />,
    );

    // Wait for data to load and check that skeletons are no longer displayed
    await waitFor(() => {
      expect(screen.queryAllByTestId(/skeleton/i).length).toBe(0);
    });

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('2.0 kB')).toBeInTheDocument();
    expect(screen.getByText('3.0 kB')).toBeInTheDocument();
    expect(screen.getByText('400 B')).toBeInTheDocument();
    expect(screen.getByText('200 B')).toBeInTheDocument();
    expect(screen.getByText('600 B')).toBeInTheDocument();
    expect(screen.getByText('150 B')).toBeInTheDocument();
  });

  test('should handle empty response data', async () => {
    // Override the default handler to return empty results
    server.use(
      http.get(baseUrl + '/appliances/es_beaconing_events/', () => {
        return HttpResponse.json({
          count: 0,
          next: null,
          previous: null,
          results: [],
        });
      }),
    );

    renderWithProviders(
      <ReportSummary
        type="ja3s"
        value="non-existent-hash"
      />,
    );

    // Wait for data to load and check that skeletons are no longer displayed
    await waitFor(() => {
      expect(screen.queryAllByTestId(/skeleton/i).length).toBe(0);
    });

    // Verify the "No results" message is displayed
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });
});
