import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { makeNrdEvent } from '@/features/events/model/event.mocks';

import { HostHuntingTrail } from './host-hunting-trail';

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

describe('HostHuntingTrail', () => {
  it('shows loading skeleton while queries are in flight', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', async () => {
        await new Promise(() => {});
        return HttpResponse.json(emptyPaginated);
      }),
    );
    renderWithProviders(<HostHuntingTrail hostId="192.168.1.5" />);
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  it('shows empty state when all sources return no events', async () => {
    await renderWithProviders(<HostHuntingTrail hostId="192.168.1.5" />, {
      router: createTestRouter(),
    });
    await waitFor(() => {
      expect(screen.getByText(/no hunting trail data/i)).toBeInTheDocument();
    });
  });

  it('shows error state when all sources fail', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () => HttpResponse.error()),
      http.get(baseUrl + '/rules/es/events_tail/', () => HttpResponse.error()),
      http.get(baseUrl + '/appliances/es_discovery_events/', () =>
        HttpResponse.error(),
      ),
    );
    await renderWithProviders(<HostHuntingTrail hostId="192.168.1.5" />, {
      router: createTestRouter(),
    });
    await waitFor(() => {
      expect(
        screen.getByText(/failed to load hunting trail data/i),
      ).toBeInTheDocument();
    });
  });

  it('renders purpose-grouped cards when data is present', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', ({ request }) => {
        const url = new URL(request.url);
        const qfilter = url.searchParams.get('qfilter') ?? '';
        if (qfilter.includes('stamus.nrd')) {
          return HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [
              makeNrdEvent({
                _id: 'n1',
                timestamp: '2026-01-12T08:00:00Z',
              }),
            ],
          });
        }
        return HttpResponse.json(emptyPaginated);
      }),
    );
    await renderWithProviders(<HostHuntingTrail hostId="192.168.1.5" />, {
      router: createTestRouter(),
    });
    await waitFor(() => {
      expect(screen.getByText('NRD')).toBeInTheDocument();
    });
  });
});
