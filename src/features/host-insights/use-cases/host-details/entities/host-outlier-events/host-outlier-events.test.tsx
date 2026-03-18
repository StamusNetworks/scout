import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { BreadcrumbProvider } from '@/common/design-system/molecules/breadcrumbs';
import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

import { HostOutlierEvents } from './host-outlier-events';

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

const mockEvent = {
  _id: 'outlier-event-1',
  '@timestamp': '2026-03-17T10:00:00Z',
  timestamp: '2026-03-17T10:00:00Z',
  event_type: 'alert',
  app_proto: 'http',
  src_ip: '192.168.1.100',
  src_port: 54321,
  dest_ip: '10.0.0.1',
  dest_port: 80,
  host: 'probe-1',
  stamus_novel: true,
  alert: {
    signature: 'ET MALWARE Test Signature',
    signature_id: 2001234,
    category: 'Malware Command and Control',
    severity: 1,
    rev: 1,
    gid: 1,
    action: 'allowed',
  },
};

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: ['/hosts/192.168.1.100/outlier-events'],
    }),
  });

const defaultProps = {
  hostId: '192.168.1.100',
  page: 1,
  pageSize: 10,
  sorting: [],
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
  onSortingChange: vi.fn(),
};

const renderTable = async (overrides?: Partial<typeof defaultProps>) => {
  const props = { ...defaultProps, ...overrides };
  return renderWithProviders(
    <BreadcrumbProvider>
      <HostOutlierEvents {...props} />
    </BreadcrumbProvider>,
    {
      router: createTestRouter(),
      preloadedState: { ...initialState },
    },
  );
};

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/rules/es/alerts_tail', () =>
      HttpResponse.json(emptyPaginated),
    ),
    http.get(baseUrl + '/rules/es/timeline', () => HttpResponse.json(null)),
  );
});

describe('HostOutlierEvents', () => {
  it('renders table with mock outlier event data', async () => {
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
      expect(screen.getByText('ET MALWARE Test Signature')).toBeInTheDocument();
    });

    expect(screen.getByText('http')).toBeInTheDocument();
  });

  it('renders empty state when no results', async () => {
    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('No outlier events found')).toBeInTheDocument();
    });
  });
});
