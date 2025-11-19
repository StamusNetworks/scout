import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';

import { TlsTail } from '../../models/tls-tail.model';
import { BeaconingMetadata } from './beaconing-metadata';

// Mock the Flow component to verify it receives the correct data
vi.mock('@/common/design-system/graphs/proto-flow/flow', () => ({
  default: vi.fn(({ events, columns }) => (
    <div data-testid="flow-component">
      <div data-testid="flow-events-count">{events.length}</div>
      <div data-testid="flow-columns-count">{columns.length}</div>
      <div data-testid="flow-content">
        {events.map((event: TlsTail, index: number) => (
          <div
            key={index}
            data-testid={`flow-event-${index}`}
          >
            {event._id}
          </div>
        ))}
      </div>
    </div>
  )),
}));

const mockJA3STlsTailResponse: Partial<TlsTail>[] = [
  {
    tenant: 1,
    '@version': '1',
    proto: 'TCP',
    agent: {
      type: 'suricata',
      name: 'agent1',
      version: '1.0.0',
      ephemeral_id: 'eph1',
      hostname: 'host1',
      id: 'id1',
    },
    community_id: 'comm1',
    see_id: 'see1',
    input: {
      type: 'log',
    },
    ether: {
      src_mac: 'aa:bb:cc:dd:ee:ff',
      dest_mac: 'ff:ee:dd:cc:bb:aa',
    },
    tags: ['tag1', 'tag2'],
    type: 'tls',
    pkt_src: 'wire',
    hostname_info: {
      subdomain: 'test',
      tld: 'com',
      domain: 'example.com',
      domain_without_tld: 'example',
      url: 'https://test.example.com',
      host: 'test.example.com',
    },
    alerted: false,
    geoip: {
      provider: {
        autonomous_system_organization: 'Test Org',
        autonomous_system_number: 123,
      },
      coordinate: [40.7128, -74.006],
      country_name: 'United States',
      longitude: -74.006,
      country: {
        name: 'United States',
        geoname_id: 6252001,
        iso_code: 'US',
      },
      timezone: 'America/New_York',
      country_code2: 'US',
      location: {
        lat: 40.7128,
        lon: -74.006,
      },
      ip: '192.168.1.1',
      latitude: 40.7128,
      continent_code: 'NA',
      continent: {
        code: 'NA',
        name: 'North America',
        geoname_id: 6255149,
      },
      country_code3: 'USA',
      registered_country: {
        name: 'United States',
        geoname_id: 6252001,
        iso_code: 'US',
      },
    },
    src_ip: '192.168.1.2',
    app_proto: 'tls',
    tls: {
      cipher_security: 'secure',
      notbefore: '2023-01-01T00:00:00Z',
      ja3: {
        string: 'ja3-string-1',
        agent: ['chrome'],
        agent_count: 1,
        hash: 'ja3-hash-1',
      },
      subject: 'CN=test.example.com',
      version: 'TLS 1.2',
      notafter: '2023-12-31T23:59:59Z',
      ja4: 'ja4-string-1',
      issuerdn: 'CN=Test CA',
      serial: '123456789',
      ja3s: {
        string: 'ja3s-string-1',
        hash: 'ja3s-hash-123',
      },
      cipher_suite: 'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
      sni: 'test.example.com',
      fingerprint: 'fingerprint-1',
    },
    dest_ip: '8.8.8.8',
    log: {
      offset: 0,
      file: {
        path: '/var/log/suricata/tls.log',
      },
    },
    host: 'host1',
    event_type: 'tls',
    dest_port: 443,
    '@timestamp': '2023-01-01T00:00:00Z',
    src_port: 12345,
    stamus_infrequent: false,
    flow_id: 123456789,
    net_info: {
      src: ['192.168.1.2'],
      src_agg: '192.168.1.2',
    },
    logger: 'suricata',
    timestamp: '2023-01-01T00:00:00Z',
    in_iface: 'eth0',
    see_name: 'see1',
    _id: 'tls-tail-1',
  },
  {
    tenant: 1,
    '@version': '1',
    proto: 'TCP',
    app_proto: 'tls',
    src_ip: '192.168.1.3',
    dest_ip: '8.8.8.8',
    tls: {
      cipher_security: 'secure',
      notbefore: '2023-01-01T00:00:00Z',
      ja3: {
        string: 'ja3-string-1',
        agent: ['chrome'],
        agent_count: 1,
        hash: 'ja3-hash-1',
      },
      subject: 'CN=test.example.com',
      version: 'TLS 1.2',
      notafter: '2023-12-31T23:59:59Z',
      ja4: 'ja4-string-1',
      issuerdn: 'CN=Test CA',
      serial: '123456789',
      ja3s: {
        string: 'ja3s-string-1',
        hash: 'ja3s-hash-123',
      },
      cipher_suite: 'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
      sni: 'test.example.com',
      fingerprint: 'fingerprint-1',
    },
    _id: 'tls-tail-2',
  },
];

const mockIPTlsTailResponse: Partial<TlsTail>[] = [
  {
    tenant: 1,
    '@version': '1',
    proto: 'TCP',
    app_proto: 'tls',
    src_ip: '192.168.2.2',
    dest_ip: '8.8.4.4',
    tls: {
      cipher_security: 'secure',
      notbefore: '2023-01-01T00:00:00Z',
      ja3: {
        string: 'ja3-string-1',
        agent: ['chrome'],
        agent_count: 1,
        hash: 'ja3-hash-1',
      },
      subject: 'CN=test.example.com',
      version: 'TLS 1.2',
      notafter: '2023-12-31T23:59:59Z',
      ja4: 'ja4-string-1',
      issuerdn: 'CN=Test CA',
      serial: '123456789',
      ja3s: {
        string: 'ja3s-string-1',
        hash: 'ja3s-hash-123',
      },
      cipher_suite: 'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
      sni: 'test.example.com',
      fingerprint: 'fingerprint-1',
    },
    _id: 'tls-tail-3',
  },
  {
    tenant: 1,
    '@version': '1',
    proto: 'TCP',
    app_proto: 'tls',
    src_ip: '192.168.2.3',
    dest_ip: '8.8.4.4',
    _id: 'tls-tail-4',
  },
];

afterEach(() => {
  vi.clearAllMocks();
});

describe('BeaconingMetadata', () => {
  beforeEach(() => {
    // Set up MSW handlers
    server.use(
      http.get(baseUrl + '/rules/es/tls_tail/', ({ request }) => {
        const url = new URL(request.url);
        const qfilter = url.searchParams.get('qfilter') || '';

        // Return different mock data based on the request query filter
        if (qfilter.includes('tls.ja3s.hash:ja3s-hash-123')) {
          return HttpResponse.json({
            count: mockJA3STlsTailResponse.length,
            next: null,
            previous: null,
            results: mockJA3STlsTailResponse,
          });
        } else if (qfilter.includes('dest_ip.raw:8.8.4.4')) {
          return HttpResponse.json({
            count: mockIPTlsTailResponse.length,
            next: null,
            previous: null,
            results: mockIPTlsTailResponse,
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

  test('should render loading state for JA3S type', async () => {
    renderWithProviders(
      <BeaconingMetadata
        type="ja3s"
        value="ja3s-hash-123"
      />,
    );
    expect(screen.getAllByTestId(/skeleton/i)).toHaveLength(8);
    expect(screen.getAllByTestId(/spin/i)).toHaveLength(8);
  });

  test('should render JA3S metadata after loading', async () => {
    renderWithProviders(
      <BeaconingMetadata
        type="ja3s"
        value="ja3s-hash-123"
      />,
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryAllByTestId(/skeleton/i)).toHaveLength(0);
    });

    // Verify Flow component is rendered with the correct data
    expect(screen.getByTestId('flow-component')).toBeInTheDocument();
    // Verify the correct number of events are passed to Flow
    expect(screen.getByTestId('flow-events-count').textContent).toBe('2');
    // Verify the correct number of columns are passed to Flow
    expect(screen.getByTestId('flow-columns-count').textContent).toBe('8');
    // Verify the event IDs are present in the Flow component
    expect(screen.getByTestId('flow-event-0').textContent).toBe('tls-tail-1');
    expect(screen.getByTestId('flow-event-1').textContent).toBe('tls-tail-2');
  });

  test('should render loading state for IP type', async () => {
    renderWithProviders(
      <BeaconingMetadata
        type="ip"
        value="8.8.4.4"
      />,
    );
    expect(screen.getAllByTestId(/skeleton/i)).toHaveLength(8);
    expect(screen.getAllByTestId(/spin/i)).toHaveLength(8);
  });

  test('should render IP metadata after loading', async () => {
    renderWithProviders(
      <BeaconingMetadata
        type="ip"
        value="8.8.4.4"
      />,
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryAllByTestId(/skeleton/i)).toHaveLength(0);
    });

    // Verify Flow component is rendered with the correct data
    expect(screen.getByTestId('flow-component')).toBeInTheDocument();
    // Verify the correct number of events are passed to Flow
    expect(screen.getByTestId('flow-events-count').textContent).toBe('2');
    // Verify the correct number of columns are passed to Flow
    expect(screen.getByTestId('flow-columns-count').textContent).toBe('8');
    // Verify the event IDs are present in the Flow component
    expect(screen.getByTestId('flow-event-0').textContent).toBe('tls-tail-3');
    expect(screen.getByTestId('flow-event-1').textContent).toBe('tls-tail-4');
  });

  test('should handle empty response data', async () => {
    // Override the default handler to return empty results
    server.use(
      http.get(baseUrl + '/rules/es/tls_tail/', () => {
        return Response.error();
      }),
    );

    renderWithProviders(
      <BeaconingMetadata
        type="ja3s"
        value="non-existent-hash"
      />,
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryAllByTestId(/skeleton/i)).toHaveLength(0);
    });

    // Verify the error message is displayed
    expect(screen.getByText('Error.')).toBeInTheDocument();
  });
});
