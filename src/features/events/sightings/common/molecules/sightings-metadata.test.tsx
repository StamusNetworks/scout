import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { SightingsMetadata } from '@/features/events/sightings/common/molecules/sightings-metadata';

// Mock sighting events for different protocols
const mockHttpSighting = {
  _id: 'http-sighting-1',
  app_proto: 'http',
  host: 'test-host',
  tx_id: 1,
  stream: 1,
  packet_info: {
    linktype: 1,
  },
  hostname_info: {
    tld: 'com',
    host: 'example.com',
    domain_without_tld: 'example',
    url: 'https://example.com',
    domain: 'example.com',
    subdomain: '',
  },
  proto: 'TCP',
  http: {
    status: 200,
    http_request_body_printable: '',
    http_method: 'GET',
    length: 1024,
    http_response_body_printable: '',
    hostname: 'example.com',
    response_headers: [
      { name: 'Content-Type', value: 'text/html' },
      { name: 'Server', value: 'Apache' },
    ],
    http_content_type: 'text/html',
    request_headers: [
      { name: 'User-Agent', value: 'Mozilla/5.0' },
      { name: 'Accept', value: '*/*' },
    ],
    url: '/index.html',
    server: 'Apache',
    protocol: 'HTTP/1.1',
  },
  net_info: {
    src: ['192.168.1.2'],
    dest_agg: '8.8.8.8',
    dest: ['8.8.8.8'],
    src_agg: '192.168.1.2',
  },
  src_ip: '192.168.1.2',
  dest_ip: '8.8.8.8',
  src_port: 12345,
  dest_port: 80,
};

describe('SightingsMetadata', () => {
  beforeEach(() => {
    // Set up MSW handlers to mock API responses
    server.use(
      http.get(`${baseUrl}/appliances/es_discovery_events/`, ({ request }) => {
        const url = new URL(request.url);
        const qfilter = url.searchParams.get('qfilter') || '';

        if (qfilter.includes('_id:http\\-sighting\\-1')) {
          return HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [mockHttpSighting],
          });
        } else if (qfilter.includes('_id:non\\-existent')) {
          return HttpResponse.json({
            count: 0,
            next: null,
            previous: null,
            results: [],
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

  test('should render loading state when fetching HTTP data', async () => {
    renderWithProviders(<SightingsMetadata sightingId="http-sighting-1" />);

    expect(screen.getAllByTestId('skeleton')).toHaveLength(4);
  });
  test('should render error message when HTTP sighting is not found', async () => {
    renderWithProviders(<SightingsMetadata sightingId="non-existent" />);

    await waitFor(() => {
      expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
    });

    expect(screen.getByText('Error.')).toBeInTheDocument();
  });
  test('should render HTTP sighting metadata correctly', async () => {
    const { container } = await renderWithProviders(
      <SightingsMetadata sightingId="http-sighting-1" />,
    );

    await waitFor(() => {
      expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
    });
    expect(container.innerHTML).not.toBe('');
    expect(container.innerHTML).not.toContain('Error.');
  });
});
