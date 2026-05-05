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

import { emptyPaginated, mockHost } from '../../api/host.mocks';
import { HostsInventoryTable } from './hosts-inventory-table';

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: ['/attack-surface/inventory'],
    }),
  });

const defaultProps = {
  page: 1,
  pageSize: 10,
  sorting: [] as { id: string; desc: boolean }[],
  inHomeNetwork: 'all' as const,
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
  onSortingChange: vi.fn(),
  onRowClick: vi.fn(),
};

const renderTable = async (overrides?: Partial<typeof defaultProps>) => {
  const props = { ...defaultProps, ...overrides };
  return renderWithProviders(
    <BreadcrumbProvider>
      <HostsInventoryTable {...props} />
    </BreadcrumbProvider>,
    {
      router: createTestRouter(),
      preloadedState: { ...initialState },
    },
  );
};

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/appliances/host_id/', () =>
      HttpResponse.json(emptyPaginated),
    ),
  );
});

describe('HostsInventoryTable', () => {
  it('renders table with mock host data', async () => {
    server.use(
      http.get(baseUrl + '/appliances/host_id/', () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [mockHost],
        }),
      ),
    );

    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
    });

    expect(screen.getByText('workstation-01.local')).toBeInTheDocument();
  });

  it('renders empty state when no results', async () => {
    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('No hosts found')).toBeInTheDocument();
    });
  });
});
