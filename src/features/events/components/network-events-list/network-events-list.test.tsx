import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

import {
  NetworkEventsList,
  NetworkEventsListProps,
} from './network-events-list';

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

const mockEvent = {
  _id: 'evt-001',
  '@timestamp': '2026-03-17T12:00:00.000Z',
  timestamp: '2026-03-17T12:00:00.000Z',
  event_type: 'http',
  src_ip: '192.168.1.10',
  src_port: 54321,
  dest_ip: '10.0.0.1',
  dest_port: 443,
  app_proto: 'http',
  flow_id: 12345,
  http: {
    hostname: 'example.com',
    url: '/api/data',
    http_method: 'GET',
    protocol: 'HTTP/1.1',
    status: 200,
    length: 1234,
  },
};

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: ['/network-events'],
    }),
  });

const defaultProps: NetworkEventsListProps = {
  page: 1,
  pageSize: 20,
  groupByFlow: true,
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
  onGroupByFlowChange: vi.fn(),
};

const renderList = async (overrides?: Partial<NetworkEventsListProps>) => {
  const props = { ...defaultProps, ...overrides };
  return renderWithProviders(<NetworkEventsList {...props} />, {
    router: createTestRouter(),
    preloadedState: { ...initialState },
  });
};

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/rules/es/events_tail/', () =>
      HttpResponse.json(emptyPaginated),
    ),
  );
});

describe('NetworkEventsList', () => {
  it('renders cards with mock event data', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/events_tail/', () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [mockEvent],
        }),
      ),
    );

    await renderList();

    await waitFor(() => {
      expect(screen.getByText('192.168.1.10')).toBeInTheDocument();
    });

    expect(screen.getByText('10.0.0.1')).toBeInTheDocument();
  });

  it('renders empty state when no results', async () => {
    await renderList();

    await waitFor(() => {
      expect(screen.getByText('No network events found')).toBeInTheDocument();
    });
  });
});
