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

import { NetworkTreeSunburst } from './network-tree-sunburst';

const emptyAggregation = {
  took: 1,
  timed_out: false,
  _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
  hits: {
    total: { value: 0, relation: 'eq' },
    max_score: null,
    hits: [],
  },
  aggregations: {
    network_nodes: {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count: 0,
      buckets: [],
    },
  },
};

const networkTreeAggregation = {
  ...emptyAggregation,
  aggregations: {
    network_nodes: {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count: 0,
      buckets: [
        {
          key: '192.168.1.0/24',
          doc_count: 5,
          unique_ips: { value: 5 },
          total_roles: { value: 3 },
          total_hostnames: { value: 4 },
          total_usernames: { value: 2 },
          total_services: { value: 6 },
        },
      ],
    },
  },
};

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: ['/attack-surface'],
    }),
  });

const renderSunburst = async (inHomeNet: 'true' | 'false' | 'all' = 'all') => {
  return renderWithProviders(
    <BreadcrumbProvider>
      <NetworkTreeSunburst inHomeNet={inHomeNet} />
    </BreadcrumbProvider>,
    {
      router: createTestRouter(),
      preloadedState: { ...initialState },
    },
  );
};

beforeEach(() => {
  server.use(
    http.post(baseUrl + '/rules/es/search/', () =>
      HttpResponse.json(emptyAggregation),
    ),
  );
});

describe('NetworkTreeSunburst', () => {
  it('renders empty state when no network tree data', async () => {
    await renderSunburst();

    await waitFor(() => {
      expect(screen.getByText('No hosts found')).toBeInTheDocument();
    });
  });

  it('renders sunburst when data is available', async () => {
    server.use(
      http.post(baseUrl + '/rules/es/search/', () =>
        HttpResponse.json(networkTreeAggregation),
      ),
    );

    await renderSunburst();

    // The sunburst renders with the Count filter and tooltip sidebar
    await waitFor(() => {
      expect(screen.getByText('Count')).toBeInTheDocument();
    });

    // The tooltip sidebar renders root node stats (IPs appears in both filter badge and tooltip)
    expect(screen.getAllByText('IPs').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Roles')).toBeInTheDocument();
    expect(screen.getByText('Hostnames')).toBeInTheDocument();
  });
});
