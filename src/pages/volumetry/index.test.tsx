import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { BreadcrumbProvider } from '@/common/design-system/molecules/breadcrumbs';
import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';

import { VolumetryPage } from './index';

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

const renderPage = async () =>
  renderWithProviders(
    <BreadcrumbProvider>
      <VolumetryPage />
    </BreadcrumbProvider>,
    { router: createTestRouter() },
  );

const mockGlobalStats = {
  volumetry: 1_500_000_000_000,
  nb_events: 245_000,
  nb_discovered_threats: 12,
  nb_discovered_policies: 3,
  nb_assets_threat_victim: 5,
  nb_assets_threat_attacker: 4,
  nb_assets_threat_both: 2,
  nb_assets_policy: 1,
  nb_threats: 8,
  nb_policies: 2,
};

const mockEventsCount = {
  prev_doc_count: 400,
  doc_count: 523,
};

const mockProbes = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      appliance_id: 2,
      name: 'SSProbe-1',
      descr: 'Stamus Probe',
      created_date: '2026-02-24T02:12:25.593266+01:00',
      updated_date: '2026-02-24T03:59:15.015230+01:00',
      address: '10.136.4.10',
      port: 22,
      last_seen: '2026-02-24T04:40:02.638155+01:00',
      cores_count: 2,
      cpu_model: 'GenuineIntel',
      memory: 3915,
      kernel: '6.1.0-43-amd64',
      distribution: 'Debian GNU/Linux 12 (bookworm)',
      app_is_up: false,
      suri_running: true,
      suri_last_seen: '2026-02-24T04:40:02.663656+01:00',
    },
  ],
};

const mockEventsTimeline = {
  took: 5,
  timed_out: false,
  _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
  hits: { total: { value: 100, relation: 'eq' }, max_score: null, hits: [] },
  aggregations: {
    date: {
      buckets: [
        {
          key_as_string: '2026-02-24T00:00:00.000Z',
          key: 1740355200000,
          doc_count: 10,
        },
        {
          key_as_string: '2026-02-24T01:00:00.000Z',
          key: 1740358800000,
          doc_count: 25,
        },
      ],
    },
  },
};

const mockEmptyTimeline = {
  took: 1,
  timed_out: false,
  _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
  hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
  aggregations: {
    date: {
      buckets: [],
    },
  },
};

const setupDefaultHandlers = () => {
  server.use(
    http.get(baseUrl + '/appliances/threat_family/global_stats', () =>
      HttpResponse.json(mockGlobalStats),
    ),
    http.get(baseUrl + '/rules/es/alerts_count', () =>
      HttpResponse.json(mockEventsCount),
    ),
    http.get(baseUrl + '/appliances/probe/', () =>
      HttpResponse.json(mockProbes),
    ),
    http.get(baseUrl + '/rules/es/events_timeline/', () =>
      HttpResponse.json(mockEventsTimeline),
    ),
  );
};

beforeEach(() => {
  setupDefaultHandlers();
});

describe('VolumetryPage', () => {
  it('renders stat cards with loaded data', async () => {
    await renderPage();

    await waitFor(() => {
      expect(
        screen.getByTestId('analyzed-traffic-counter'),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('network-transactions-counter'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('events-counter')).toBeInTheDocument();
    });

    await waitFor(() => {
      const values = screen.getAllByTestId('statscard-value');
      expect(values.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('renders the probe search and probe list', async () => {
    await renderPage();

    expect(
      screen.getByPlaceholderText('Filter probes by name...'),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('SSProbe-1')).toBeInTheDocument();
    });
  });

  it('displays page title and description', async () => {
    await renderPage();

    expect(screen.getByText('Volumetry')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Overview of network data volume, transactions, and detection events over the selected time period.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the series toggle bar with all series', async () => {
    await renderPage();

    expect(screen.getByText('Network Events')).toBeInTheDocument();
    expect(screen.getByText('Flows')).toBeInTheDocument();
    expect(screen.getByText('Alerts')).toBeInTheDocument();
    expect(screen.getByText('Compromises')).toBeInTheDocument();
    expect(screen.getByText('Policy Violations')).toBeInTheDocument();
    expect(screen.getByText('Sightings')).toBeInTheDocument();
    expect(screen.getByText('Outlier Events')).toBeInTheDocument();
  });

  it('toggles series visibility on click', async () => {
    const user = userEvent.setup();
    await renderPage();

    const networkEventsToggle = screen
      .getByText('Network Events')
      .closest('button')!;
    expect(networkEventsToggle).toHaveAttribute('data-state', 'on');

    const flowsToggle = screen.getByText('Flows').closest('button')!;
    expect(flowsToggle).toHaveAttribute('data-state', 'off');

    await user.click(flowsToggle);
    expect(flowsToggle).toHaveAttribute('data-state', 'on');
  });

  it('shows error state when timeline API fails', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/events_timeline/', () =>
        HttpResponse.json(null, { status: 500 }),
      ),
    );

    await renderPage();

    await waitFor(() => {
      const errorMessages = screen.getAllByText('Failed to load timeline data');
      expect(errorMessages.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows empty state when timeline returns no buckets', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/events_timeline/', () =>
        HttpResponse.json(mockEmptyTimeline),
      ),
    );

    await renderPage();

    await waitFor(() => {
      const emptyMessages = screen.getAllByText('No data for this time range');
      expect(emptyMessages.length).toBeGreaterThanOrEqual(1);
    });
  });
});
