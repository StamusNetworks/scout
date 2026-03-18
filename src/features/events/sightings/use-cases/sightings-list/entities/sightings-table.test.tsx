import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { Event } from '@/features/hunt/events/model/event.schema';

import { SightingsTable } from './sightings-table';

const mockSightingEvent: Partial<Event> = {
  _id: 'sighting-1',
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

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/sightings'] }),
  });

const defaultProps = {
  page: 1,
  pageSize: 10,
  sorting: [{ id: 'timestamp', desc: true }],
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
  onSortingChange: vi.fn(),
  onRowClick: vi.fn(),
};

const renderTable = async (overrides?: Partial<typeof defaultProps>) => {
  const props = { ...defaultProps, ...overrides };
  return renderWithProviders(<SightingsTable {...props} />, {
    router: createTestRouter(),
  });
};

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/appliances/es_discovery_events/', () =>
      HttpResponse.json(emptyPaginated),
    ),
  );
});

describe('SightingsTable', () => {
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
      expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    expect(screen.getByText('probe-01')).toBeInTheDocument();
  });

  it('renders empty state when no results', async () => {
    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('No sightings found')).toBeInTheDocument();
    });
  });
});
