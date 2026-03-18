import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import type { SortingState } from '@tanstack/react-table';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { BreadcrumbProvider } from '@/common/design-system/molecules/breadcrumbs';
import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

import { IncidentsTable, IncidentsTableProps } from './incidents-table';

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: ['/threats/compromises/incidents'],
    }),
  });

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

const defaultProps: IncidentsTableProps = {
  page: 1,
  pageSize: 10,
  sorting: [] as SortingState,
  onPageChange: () => {},
  onPageSizeChange: () => {},
  onSortingChange: () => {},
};

const mockEntity = {
  pk: 1,
  value: '10.0.0.1',
  asset_type: 'ip',
  tenant: 1,
  network_def: null,
  first_seen: '2026-02-20T00:00:00Z',
  last_seen: '2026-02-25T00:00:00Z',
  threats: [{ pk: 1, threat_id: 1, name: 'Test Threat' }],
  status: 'new',
  fixed_date: null,
  kill_chain: 'initial_compromise',
  kill_chain_offender: 'initial_compromise',
  is_offender: false,
};

const renderTable = async (props: Partial<IncidentsTableProps> = {}) =>
  renderWithProviders(
    <BreadcrumbProvider>
      <IncidentsTable
        {...defaultProps}
        {...props}
      />
    </BreadcrumbProvider>,
    {
      router: createTestRouter(),
      preloadedState: {
        ...initialState,
      },
    },
  );

beforeEach(() => {
  server.use(
    // No incidents
    http.get('*/api/v2/appliances/threat-status/', () =>
      HttpResponse.json(emptyPaginated),
    ),
    // Threats list (used by useThreats hook)
    http.get('*/api/v2/appliances/threats/', () =>
      HttpResponse.json(emptyPaginated),
    ),
  );
});

describe('IncidentsTable - Empty state', () => {
  it('shows plural impacted entities message when count > 1', async () => {
    server.use(
      http.get(baseUrl + '/appliances/threat/threats_per_asset/', () =>
        HttpResponse.json({
          count: 3,
          next: null,
          previous: null,
          results: [mockEntity],
        }),
      ),
    );

    await renderTable();

    await waitFor(() => {
      expect(
        screen.getByText('No incidents during this period'),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/3 impacted entities/)).toBeInTheDocument();

    const entitiesLink = screen.getByRole('link', {
      name: /view impacted entities/i,
    });
    expect(entitiesLink).toHaveAttribute(
      'href',
      '/threats/compromises/entities',
    );
  });

  it('shows singular impacted entity message when count is 1', async () => {
    server.use(
      http.get(baseUrl + '/appliances/threat/threats_per_asset/', () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [mockEntity],
        }),
      ),
    );

    await renderTable();

    await waitFor(() => {
      expect(
        screen.getByText('No incidents during this period'),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/1 impacted entity\b/)).toBeInTheDocument();

    const entitiesLink = screen.getByRole('link', {
      name: /view impacted entity/i,
    });
    expect(entitiesLink).toHaveAttribute(
      'href',
      '/threats/compromises/entities',
    );
  });

  it('shows celebratory message when there are no impacted entities', async () => {
    server.use(
      http.get(baseUrl + '/appliances/threat/threats_per_asset/', () =>
        HttpResponse.json(emptyPaginated),
      ),
    );

    await renderTable();

    await waitFor(() => {
      expect(
        screen.getByText('No incidents during this period'),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/finally have time to go through/),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: /policy violations/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /go hunting/i }),
    ).toBeInTheDocument();
  });

  it('accepts page and pageSize props', async () => {
    server.use(
      http.get(baseUrl + '/appliances/threat/threats_per_asset/', () =>
        HttpResponse.json(emptyPaginated),
      ),
    );

    await renderTable({ page: 2, pageSize: 25 });

    await waitFor(() => {
      expect(
        screen.getByText('No incidents during this period'),
      ).toBeInTheDocument();
    });
  });
});
