import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import {
  makeLateralEvent,
  makeNrdEvent,
} from '@/features/events/common/events.mocks';
import { makeSightingApiEvent } from '@/features/events/sightings/common/sightings.mocks';

import { HuntingTrail } from './hunting-trail';

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/rules/es/alerts_tail', () =>
      HttpResponse.json(emptyPaginated),
    ),
    http.get(baseUrl + '/rules/es/events_tail/', () =>
      HttpResponse.json(emptyPaginated),
    ),
    http.get(baseUrl + '/appliances/es_discovery_events/', () =>
      HttpResponse.json(emptyPaginated),
    ),
  );
});

const renderComponent = () =>
  renderWithProviders(
    <HuntingTrail
      asset="192.168.1.5"
      startDate={1736640000000}
      endDate={1736899200000}
    />,
    {
      router: createTestRouter(),
    },
  );

describe('HuntingTrail', () => {
  it('shows loading skeleton while queries are in flight', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', async () => {
        await new Promise(() => {});
        return HttpResponse.json(emptyPaginated);
      }),
    );
    // No router: synchronous render to catch initial loading state
    renderWithProviders(
      <HuntingTrail
        asset="192.168.1.5"
        startDate={1736640000000}
        endDate={1736899200000}
      />,
    );
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  it('shows empty state when all sources return no events', async () => {
    await renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/no hunting trail data/i)).toBeInTheDocument();
    });
  });

  it('shows error state when all 5 sources fail', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () => HttpResponse.error()),
      http.get(baseUrl + '/rules/es/events_tail/', () => HttpResponse.error()),
      http.get(baseUrl + '/appliances/es_discovery_events/', () =>
        HttpResponse.error(),
      ),
    );
    await renderComponent();
    await waitFor(() => {
      expect(
        screen.getByText(/failed to load hunting trail data/i),
      ).toBeInTheDocument();
    });
  });

  it('renders a card for each consecutive group', async () => {
    const nrd1 = makeNrdEvent({ _id: 'n1', timestamp: '2026-01-12T08:00:00Z' });
    const nrd2 = makeNrdEvent({ _id: 'n2', timestamp: '2026-01-12T09:00:00Z' });
    const lateral = makeLateralEvent({ timestamp: '2026-01-12T15:00:00Z' });

    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', ({ request }) => {
        const url = new URL(request.url);
        const qfilter = url.searchParams.get('qfilter') ?? '';
        if (qfilter.includes('stamus.nrd')) {
          return HttpResponse.json({
            count: 2,
            next: null,
            previous: null,
            results: [nrd1, nrd2],
          });
        }
        if (qfilter.includes('smb_lateral')) {
          return HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [lateral],
          });
        }
        return HttpResponse.json(emptyPaginated);
      }),
    );

    await renderComponent();
    await waitFor(() => {
      expect(screen.getByText('NRD')).toBeInTheDocument();
      expect(screen.getByText('Lateral')).toBeInTheDocument();
    });
    expect(screen.getByText('2 events')).toBeInTheDocument();
  });

  it('shows partial results when only some sources succeed', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () => HttpResponse.error()),
      http.get(baseUrl + '/appliances/es_discovery_events/', () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [makeSightingApiEvent()],
        }),
      ),
    );
    await renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Sightings')).toBeInTheDocument();
    });
    expect(
      screen.queryByText(/failed to load hunting trail data/i),
    ).not.toBeInTheDocument();
  });

  it('"Show events" reveals all event rows', async () => {
    const nrdEvents = Array.from({ length: 7 }, (_, i) => {
      const hour = String(i + 8).padStart(2, '0');
      return makeNrdEvent({
        _id: `nrd-${i}`,
        timestamp: `2026-01-12T${hour}:00:00Z`,
        hostname_info: {
          domain: `domain-${i}.io`,
          host: `domain-${i}.io`,
          url: `http://domain-${i}.io`,
          tld: 'io',
          subdomain: '',
          domain_without_tld: `domain-${i}`,
        },
      });
    });
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', ({ request }) => {
        const url = new URL(request.url);
        const qfilter = url.searchParams.get('qfilter') ?? '';
        if (qfilter.includes('stamus.nrd')) {
          return HttpResponse.json({
            count: 7,
            next: null,
            previous: null,
            results: nrdEvents,
          });
        }
        return HttpResponse.json(emptyPaginated);
      }),
    );

    await renderComponent();

    // Default view is summary — click "Show events" to reveal all rows
    await waitFor(() => {
      expect(screen.getByText('Show events')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Show events'));

    // All 7 events visible immediately (no pagination)
    await waitFor(() => {
      expect(screen.getByText('domain-6.io')).toBeInTheDocument();
    });
  });
});
