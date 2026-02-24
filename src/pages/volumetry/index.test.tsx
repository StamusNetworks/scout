import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';

import { BreadcrumbProvider } from '@/common/design-system/molecules/breadcrumbs';
import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';

import { VolumetryPage } from './index';

const renderPage = () =>
  renderWithProviders(
    <MemoryRouter>
      <BreadcrumbProvider>
        <VolumetryPage />
      </BreadcrumbProvider>
    </MemoryRouter>,
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

const mockCountsTimeline = {
  from_date: 1700000000000,
  to_date: 1700086400000,
  interval: 3600000,
  relevant: {
    entries: [
      { time: 1700000000000, count: 10 },
      { time: 1700003600000, count: 25 },
    ],
  },
};

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/appliances/threat_family/global_stats', () =>
      HttpResponse.json(mockGlobalStats),
    ),
    http.get(baseUrl + '/rules/es/alerts_count', () =>
      HttpResponse.json(mockEventsCount),
    ),
    http.get(baseUrl + '/rules/es/timeline/', () =>
      HttpResponse.json(mockCountsTimeline),
    ),
  );
});

describe('VolumetryPage', () => {
  it('renders stat cards with loaded data', async () => {
    renderPage();

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

  it('renders the events timeline section', async () => {
    renderPage();

    expect(screen.getByText('Events Timeline')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('Probes')).toBeInTheDocument();
  });

  it('displays page title and description', () => {
    renderPage();

    expect(screen.getByText('Volumetry')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Overview of network data volume, transactions, and detection events over the selected time period.',
      ),
    ).toBeInTheDocument();
  });
});
