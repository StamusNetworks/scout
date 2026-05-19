import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { BreadcrumbProvider } from '@/common/design-system/molecules/breadcrumbs';
import { server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

import { HostIncidentsTable } from './host-incidents-table';

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

const mockThreat = {
  pk: 42,
  name: 'Test Threat Alpha',
  family_class: 'doc',
  description: 'A test threat',
};

const mockThreatStatus = {
  id: 1,
  status: 'new',
  tenant: 1,
  first_seen: '2026-01-15T12:00:00Z',
  last_seen: '2026-03-17T10:00:00Z',
  close_status_date: '2026-03-17T10:00:00Z',
  kill_chain: null,
  kill_chain_offender: null,
  threat_id: 42,
  asset: '192.168.1.100',
  is_offender: false,
};

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: ['/hosts/192.168.1.100/incidents'],
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
      <HostIncidentsTable {...props} />
    </BreadcrumbProvider>,
    {
      router: createTestRouter(),
      preloadedState: { ...initialState },
    },
  );
};

beforeEach(() => {
  server.use(
    http.get('*/api/v2/appliances/threat-status/', () =>
      HttpResponse.json(emptyPaginated),
    ),
    http.get('*/api/v2/appliances/threats/', () =>
      HttpResponse.json(emptyPaginated),
    ),
  );
});

describe('HostIncidentsTable', () => {
  it('renders table with mock incident data', async () => {
    server.use(
      http.get('*/api/v2/appliances/threat-status/', () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [mockThreatStatus],
        }),
      ),
      http.get('*/api/v2/appliances/threats/', () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [mockThreat],
        }),
      ),
    );

    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('Test Threat Alpha')).toBeInTheDocument();
    });
  });

  it('renders empty state when no results', async () => {
    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('No incidents found')).toBeInTheDocument();
    });
  });

  it('forwards the page prop to the API request', async () => {
    let receivedPage: string | null = null;
    server.use(
      http.get('*/api/v2/appliances/threat-status/', ({ request }) => {
        receivedPage = new URL(request.url).searchParams.get('page');
        return HttpResponse.json(emptyPaginated);
      }),
    );

    await renderTable({ page: 2 });

    await waitFor(() => {
      expect(receivedPage).toBe('2');
    });
  });
});
