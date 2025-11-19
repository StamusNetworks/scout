import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';

import { SightingEventsTailFlow } from './sighting-events-tail-flow';

// Mock sightings data
const mockDnsSighting = {
  _id: 'dns-sighting-1',
  host: 'sensor-1',
  app_proto: 'dns',
  discovery: {
    key: 'dns.query.rrname',
    value: 'example.com',
    asset: 'dns-asset',
  },
};

const mockHttpSighting = {
  _id: 'http-sighting-1',
  host: 'sensor-2',
  app_proto: 'http',
  discovery: {
    key: 'http.server',
    value: 'Apache/2.4.41',
    asset: 'http-asset',
  },
};

// Mock DNS event tails
const mockDnsEventTails = [
  {
    _id: 'dns-event-1',
    app_proto: 'dns',
    host: 'sensor-1',
    event_type: 'dns',
    proto: 'UDP',
    src_ip: '192.168.1.10',
    dest_ip: '8.8.8.8',
    src_port: 45678,
    dest_port: 53,
    dns: {
      query: [
        {
          rrname: 'example.com',
          rrtype: 'A',
        },
      ],
      type: 'query',
      rrname: 'example.com',
    },
  },
  {
    _id: 'dns-event-2',
    app_proto: 'dns',
    host: 'sensor-1',
    event_type: 'dns',
    proto: 'UDP',
    src_ip: '192.168.1.11',
    dest_ip: '8.8.8.8',
    src_port: 46789,
    dest_port: 53,
    dns: {
      query: [
        {
          rrname: 'example.com',
          rrtype: 'AAAA',
        },
      ],
      type: 'query',
      rrname: 'example.com',
    },
  },
  {
    _id: 'dns-event-3',
    app_proto: 'dns',
    host: 'sensor-1',
    event_type: 'dns',
    proto: 'TCP', // Different protocol to test variety
    src_ip: '192.168.1.12',
    dest_ip: '8.8.4.4',
    src_port: 47890,
    dest_port: 53,
    dns: {
      query: [
        {
          rrname: 'example.com',
          rrtype: 'MX', // Different query type
        },
      ],
      type: 'query',
      rrname: 'example.com',
    },
    // Missing some fields to test handling of missing values
  },
];

// Mock HTTP event tails
const mockHttpEventTails = [
  {
    _id: 'http-event-1',
    app_proto: 'http',
    host: 'sensor-2',
    event_type: 'http',
    proto: 'TCP',
    src_ip: '192.168.1.20',
    dest_ip: '203.0.113.10',
    src_port: 55678,
    dest_port: 80,
    http: {
      hostname: 'www.example.com',
      http_method: 'GET',
      url: '/index.html',
      status: 200,
      http_user_agent: 'Mozilla/5.0',
      server: 'Apache/2.4.41',
      protocol: 'HTTP/1.1',
      http_content_type: 'text/html',
      length: 1024,
      response_headers: [
        { name: 'Content-Type', value: 'text/html' },
        { name: 'Server', value: 'Apache/2.4.41' },
      ],
      request_headers: [
        { name: 'User-Agent', value: 'Mozilla/5.0' },
        { name: 'Accept', value: '*/*' },
      ],
    },
  },
  {
    _id: 'http-event-2',
    app_proto: 'http',
    host: 'sensor-2',
    event_type: 'http',
    proto: 'TCP',
    src_ip: '192.168.1.21',
    dest_ip: '203.0.113.10',
    src_port: 56789,
    dest_port: 80,
    http: {
      hostname: 'www.example.com',
      http_method: 'POST',
      url: '/api/data',
      status: 201,
      http_user_agent: 'curl/7.68.0',
      server: 'Apache/2.4.41',
      protocol: 'HTTP/1.1',
      http_content_type: 'application/json',
      length: 512,
      response_headers: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Server', value: 'Apache/2.4.41' },
      ],
      request_headers: [
        { name: 'User-Agent', value: 'curl/7.68.0' },
        { name: 'Content-Type', value: 'application/json' },
      ],
    },
  },
  {
    _id: 'http-event-3',
    app_proto: 'http',
    host: 'sensor-2',
    event_type: 'http',
    proto: 'TCP',
    src_ip: '192.168.1.22',
    dest_ip: '203.0.113.10',
    src_port: 57890,
    dest_port: 80,
    http: {
      hostname: 'api.example.com', // Different hostname
      http_method: 'PUT',
      url: '/api/resource/123',
      status: 204,
      server: 'Apache/2.4.41',
      protocol: 'HTTP/1.1',
      // Missing http_user_agent to test missing values
      http_content_type: 'application/json',
      length: 256,
      response_headers: [{ name: 'Server', value: 'Apache/2.4.41' }],
      request_headers: [{ name: 'Content-Type', value: 'application/json' }],
    },
  },
];

describe('SightingEventsTailFlow', () => {
  beforeEach(() => {
    // Set up MSW handlers for the API responses
    server.use(
      // Mock the getSightingEvents API endpoint for DNS sighting
      http.get(`${baseUrl}/appliances/es_discovery_events/`, ({ request }) => {
        const url = new URL(request.url);
        const qfilter = url.searchParams.get('qfilter');

        if (qfilter?.includes('_id:dns-sighting-1')) {
          return HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [mockDnsSighting],
          });
        } else if (qfilter?.includes('_id:http-sighting-1')) {
          return HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [mockHttpSighting],
          });
        } else if (qfilter?.includes('_id:non-existent-sighting')) {
          return HttpResponse.json({
            count: 0,
            next: null,
            previous: null,
            results: [],
          });
        } else if (qfilter?.includes('_id:invalid-sighting')) {
          // Sighting without required fields
          return HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [{ _id: 'invalid-sighting', host: 'sensor-3' }], // Missing discovery and app_proto
          });
        }

        return HttpResponse.json({
          count: 0,
          next: null,
          previous: null,
          results: [],
        });
      }),

      // Mock the getEventsTail API endpoint
      http.get(`${baseUrl}/rules/es/events_tail/`, ({ request }) => {
        const url = new URL(request.url);
        const qfilter = url.searchParams.get('qfilter');

        if (
          qfilter?.includes(
            'dns.type:"query" AND dns.rrname.raw:"example.com"',
          ) &&
          qfilter?.includes('event_type:"dns"')
        ) {
          return HttpResponse.json({
            count: mockDnsEventTails.length,
            next: null,
            previous: null,
            results: mockDnsEventTails,
          });
        } else if (
          qfilter?.includes('http.server.raw:"Apache/2.4.41"') &&
          qfilter?.includes('event_type:"http"')
        ) {
          return HttpResponse.json({
            count: mockHttpEventTails.length,
            next: null,
            previous: null,
            results: mockHttpEventTails,
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

  test('should render loading state', async () => {
    renderWithProviders(<SightingEventsTailFlow sightingId="dns-sighting-1" />);

    // Loading state should show FlowSkeleton
    expect(screen.getAllByTestId('skeleton')).toHaveLength(16);
  });

  test('should render error state when sighting is not found', async () => {
    renderWithProviders(
      <SightingEventsTailFlow sightingId="non-existent-sighting" />,
    );

    await waitFor(() => {
      expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
    });

    expect(screen.getByText('No data.')).toBeInTheDocument();
  });

  test('should render error state when sighting is missing required fields', async () => {
    renderWithProviders(
      <SightingEventsTailFlow sightingId="invalid-sighting" />,
    );

    await waitFor(() => {
      expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
    });

    expect(screen.getByText('Error.')).toBeInTheDocument();
  });

  test('should render "No data" when no events are found', async () => {
    // Create a sighting that will return no events
    server.use(
      http.get(`${baseUrl}/appliances/es_discovery_events/`, ({ request }) => {
        const url = new URL(request.url);
        const qfilter = url.searchParams.get('qfilter');

        if (qfilter?.includes('_id:empty-sighting')) {
          return HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [
              {
                _id: 'empty-sighting',
                host: 'sensor-4',
                app_proto: 'http',
                discovery: {
                  key: ['http.server'],
                  value: 'no-results',
                  asset: 'empty-asset',
                },
              },
            ],
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

    renderWithProviders(<SightingEventsTailFlow sightingId="empty-sighting" />);

    await waitFor(() => {
      expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
    });

    expect(screen.getByText('No data.')).toBeInTheDocument();
  });

  test('should render DNS sighting with event tails', async () => {
    renderWithProviders(<SightingEventsTailFlow sightingId="dns-sighting-1" />);

    await waitFor(() => {
      expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
    });

    // The Flow component renders a table with headers
    // Verify DNS headers are present with counts
    expect(screen.getByText(/Rrname/)).toBeInTheDocument();
    expect(screen.getByText(/Rrtype/)).toBeInTheDocument();
    expect(screen.getByText(/Protocol/)).toBeInTheDocument();

    // Check for the presence of specific DNS values
    const tableContent = screen.getByRole('table').textContent;
    expect(tableContent).toContain('example.com');
    expect(tableContent).toContain('A');
    expect(tableContent).toContain('AAAA');
    expect(tableContent).toContain('MX');
    expect(tableContent).toContain('UDP');
    expect(tableContent).toContain('TCP');
  });

  test('should render HTTP sighting with event tails', async () => {
    renderWithProviders(
      <SightingEventsTailFlow sightingId="http-sighting-1" />,
    );

    await waitFor(() => {
      expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
    });

    // Verify HTTP headers are present
    expect(screen.getByText(/User agent/)).toBeInTheDocument();
    expect(screen.getByText(/Hostname/)).toBeInTheDocument();
    expect(screen.getByText(/Method/)).toBeInTheDocument();
    expect(screen.getByText(/URL/)).toBeInTheDocument();
    expect(screen.getByText(/Status/)).toBeInTheDocument();

    // Check for the presence of specific HTTP values
    const tableContent = screen.getByRole('table').textContent;
    expect(tableContent).toContain('Mozilla/5.0');
    expect(tableContent).toContain('curl/7.68.0');
    expect(tableContent).toContain('www.example.com');
    expect(tableContent).toContain('api.example.com');
    expect(tableContent).toContain('GET');
    expect(tableContent).toContain('POST');
    expect(tableContent).toContain('PUT');
    expect(tableContent).toContain('/index.html');
    expect(tableContent).toContain('/api/data');
    expect(tableContent).toContain('/api/resource/123');
    expect(tableContent).toContain('200');
    expect(tableContent).toContain('201');
    expect(tableContent).toContain('204');

    // Verify N/A is shown for missing http_user_agent in the third event
    expect(tableContent).toContain('N/A');
  });
});
