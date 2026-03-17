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

import { DetectionEventsTable } from './detection-events-table';

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

const mockEvent = {
  _id: 'evt-001',
  '@timestamp': '2026-03-17T12:00:00.000Z',
  timestamp: '2026-03-17T12:00:00.000Z',
  event_type: 'alert',
  src_ip: '192.168.1.10',
  src_port: 54321,
  dest_ip: '10.0.0.1',
  dest_port: 443,
  app_proto: 'tls',
  host: 'sensor-01',
  alert: {
    signature: 'ET MALWARE Known Bot Command',
    signature_id: 2024792,
    category: 'A Network Trojan was detected',
    severity: 1,
    action: 'allowed',
    rev: 3,
    gid: 1,
    tag: 'relevant',
  },
};

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: ['/detection-events'],
    }),
  });

const defaultSearch = {
  page: 1,
  page_size: 10,
  sort: '-timestamp',
};

const mockNavigate = vi.fn();

const renderTable = async (
  overrides?: Partial<typeof defaultSearch>,
  hostId?: string,
) => {
  const search = { ...defaultSearch, ...overrides };
  return renderWithProviders(
    <DetectionEventsTable
      search={search}
      navigate={mockNavigate}
      hostId={hostId}
    />,
    {
      router: createTestRouter(),
      preloadedState: { ...initialState },
    },
  );
};

beforeEach(() => {
  mockNavigate.mockClear();
  server.use(
    http.get(baseUrl + '/rules/es/alerts_tail', () =>
      HttpResponse.json(emptyPaginated),
    ),
  );
});

describe('DetectionEventsTable', () => {
  it('renders table with mock event data', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [mockEvent],
        }),
      ),
    );

    await renderTable();

    await waitFor(() => {
      expect(
        screen.getByText('ET MALWARE Known Bot Command'),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('192.168.1.10')).toBeInTheDocument();
  });

  it('renders empty state when no results', async () => {
    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('No events found')).toBeInTheDocument();
    });
  });

  it('renders export button', async () => {
    await renderTable();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /download/i }),
      ).toBeInTheDocument();
    });
  });
});
