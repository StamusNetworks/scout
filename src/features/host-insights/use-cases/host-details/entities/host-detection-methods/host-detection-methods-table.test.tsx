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

import { HostDetectionMethodsTable } from './host-detection-methods-table';

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

const mockSignature = {
  pk: 2100498,
  sid: 2100498,
  category: {
    pk: 1,
    name: 'Attempted Information Leak',
    descr: '',
    created_date: '2026-01-01T00:00:00Z',
    source: 1,
  },
  msg: 'GPL ATTACK_RESPONSE id check returned root',
  created: '2026-01-15T12:00:00Z',
  updated: '2026-03-17T10:00:00Z',
  hits: 42,
  versions: [],
  threat_info: {
    family: '',
    name: '',
    description: '',
    source: '',
    created: '',
    updated: '',
  },
  timeline_data: { date: 0, hits: 0 },
};

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: ['/hosts/192.168.1.100/detection-methods'],
    }),
  });

const defaultProps = {
  hostId: '192.168.1.100',
  page: 1,
  pageSize: 10,
  sorting: [{ id: 'hits', desc: true }],
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
  onSortingChange: vi.fn(),
};

const renderTable = async (overrides?: Partial<typeof defaultProps>) => {
  const props = { ...defaultProps, ...overrides };
  return renderWithProviders(
    <BreadcrumbProvider>
      <HostDetectionMethodsTable {...props} />
    </BreadcrumbProvider>,
    {
      router: createTestRouter(),
      preloadedState: { ...initialState },
    },
  );
};

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/rules/rule/', () => HttpResponse.json(emptyPaginated)),
  );
});

describe('HostDetectionMethodsTable', () => {
  it('renders table with mock signature data', async () => {
    server.use(
      http.get(baseUrl + '/rules/rule/', () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [mockSignature],
        }),
      ),
    );

    await renderTable();

    await waitFor(() => {
      expect(
        screen.getByText('GPL ATTACK_RESPONSE id check returned root'),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('2100498')).toBeInTheDocument();
    expect(screen.getByText('Attempted Information Leak')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders empty state when no results', async () => {
    await renderTable();

    await waitFor(() => {
      expect(
        screen.getByText('No detection methods found'),
      ).toBeInTheDocument();
    });
  });
});
