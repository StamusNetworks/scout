import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import { MemoryRouter } from 'react-router-dom';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

import { ThreatsIncidentsPage } from './index';

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

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

const renderPage = () =>
  renderWithProviders(
    <MemoryRouter initialEntries={['/threats/incidents']}>
      <NuqsAdapter>
        <ThreatsIncidentsPage />
      </NuqsAdapter>
    </MemoryRouter>,
    {
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

describe('ThreatsIncidentsPage - Empty state', () => {
  it('shows impacted entities message and CTA when there are impacted entities', async () => {
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

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText('No incidents during this period'),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/3 impacted entities/)).toBeInTheDocument();

    const entitiesLink = screen.getByRole('link', {
      name: /view impacted entities/i,
    });
    expect(entitiesLink).toBeInTheDocument();
    expect(entitiesLink).toHaveAttribute('href', '/threats/entities');
  });

  it('shows celebratory message when there are no impacted entities', async () => {
    server.use(
      http.get(baseUrl + '/appliances/threat/threats_per_asset/', () =>
        HttpResponse.json(emptyPaginated),
      ),
    );

    renderPage();

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
});
