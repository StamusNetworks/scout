import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';

import { huntingTrailFilterSetsFixture } from '@/common/testing/fixtures/hunting-trail-filter-sets';
import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { makeLateralEvent, makeNrdEvent } from '@/features/events';

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
    http.get(baseUrl + '/rules/hunt_filter_sets/', () =>
      HttpResponse.json(huntingTrailFilterSetsFixture),
    ),
  );
});

const renderComponent = () =>
  renderWithProviders(
    <HuntingTrail
      asset="192.168.1.5"
      from={1736640000000}
      to={1736899200000}
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
    renderWithProviders(
      <HuntingTrail
        asset="192.168.1.5"
        from={1736640000000}
        to={1736899200000}
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

  it('shows error state when all sources fail', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () => HttpResponse.error()),
      http.get(baseUrl + '/rules/es/events_tail/', () => HttpResponse.error()),
    );
    await renderComponent();
    await waitFor(() => {
      expect(
        screen.getByText(/failed to load hunting trail data/i),
      ).toBeInTheDocument();
    });
  });

  it('renders purpose-grouped cards when data is present', async () => {
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
      expect(
        screen.getByText('Hunt: Newly Registered Domains (NRD)'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Hunt: Stamus critical lateral SMB, DCERPC'),
      ).toBeInTheDocument();
    });
    expect(screen.getAllByText('2 events').length).toBeGreaterThan(0);
  });

  it('shows partial results when only the Sightings qfilter succeeds on alerts_tail', async () => {
    const discoverySpy = vi.fn();
    server.use(
      http.get(baseUrl + '/appliances/es_discovery_events/', () => {
        discoverySpy();
        return HttpResponse.json(emptyPaginated);
      }),
      http.get(baseUrl + '/rules/es/alerts_tail', ({ request }) => {
        const url = new URL(request.url);
        const qfilter = url.searchParams.get('qfilter') ?? '';
        // After Slice B, `alert=true` is a separate query param (event-type
        // flag), so the Sightings qfilter is just `discovery:*` plus the
        // host-IP wrapper.
        if (
          qfilter.includes('discovery:*') &&
          qfilter.includes('192.168.1.5') &&
          url.searchParams.get('alert') === 'true'
        ) {
          return HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [
              makeNrdEvent({
                _id: 's1',
                timestamp: '2026-01-12T08:00:00Z',
              }),
            ],
          });
        }
        return HttpResponse.error();
      }),
      http.get(baseUrl + '/rules/es/events_tail/', () => HttpResponse.error()),
    );
    await renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Sightings')).toBeInTheDocument();
    });
    expect(
      screen.queryByText(/failed to load hunting trail data/i),
    ).not.toBeInTheDocument();
    expect(discoverySpy).not.toHaveBeenCalled();
  });

  describe('run banner', () => {
    it('renders the banner with the host-surface total (37) when queries settle empty', async () => {
      await renderComponent();
      await waitFor(() => {
        expect(
          screen.getByText(/37 queries ran · 0 returned results/),
        ).toBeInTheDocument();
      });
      expect(
        screen.getByRole('link', { name: /learn more/i }),
      ).toBeInTheDocument();
    });

    it('renders the banner while queries are still inflight', () => {
      server.use(
        http.get(baseUrl + '/rules/es/alerts_tail', async () => {
          await new Promise(() => {});
          return HttpResponse.json(emptyPaginated);
        }),
      );
      renderWithProviders(
        <HuntingTrail
          asset="192.168.1.5"
          from={1736640000000}
          to={1736899200000}
        />,
      );
      expect(screen.getByText(/queries ran ·/)).toBeInTheDocument();
    });
  });
});
