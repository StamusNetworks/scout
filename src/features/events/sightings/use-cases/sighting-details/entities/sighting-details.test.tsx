import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { Event } from '@/features/events/model/event';

import { SightingDetails } from './sighting-details';

const mockSightingEvent: Partial<Event> = {
  _id: 'sighting-123',
  '@timestamp': '2024-01-15T10:00:00Z',
  timestamp: '2024-01-15T10:00:00Z',
  app_proto: 'tls',
  event_type: 'discovery',
  src_ip: '10.0.0.1',
  src_port: 43210,
  dest_ip: '192.168.1.100',
  dest_port: 443,
  host: 'probe-01',
  discovery: {
    asset: '10.0.0.1',
    asset_net: '10.0.0.0/24',
    asset_role: ['domain controller'],
    key: 'tls.sni',
    value: 'example.com',
  },
};

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: ['/sightings/sighting-123'],
    }),
  });

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/appliances/es_discovery_events/', () =>
      HttpResponse.json({ count: 0, next: null, previous: null, results: [] }),
    ),
  );
});

describe('SightingDetails', () => {
  it('renders discovery key and value when data loads', async () => {
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

    await renderWithProviders(<SightingDetails sightingId="sighting-123" />, {
      router: createTestRouter(),
    });

    await waitFor(() => {
      expect(screen.getAllByText('example.com').length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText('probe-01').length).toBeGreaterThan(0);
  });
});
