import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

import { HostFilesTabBadge } from './host-tab-badges';

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

const renderBadge = async (hostId: string) =>
  renderWithProviders(<HostFilesTabBadge hostId={hostId} />, {
    preloadedState: { ...initialState },
  });

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/rules/es/events_tail/', () =>
      HttpResponse.json(emptyPaginated),
    ),
  );
});

describe('HostFilesTabBadge', () => {
  it('queries events_tail with the fileinfo qfilter and pageSize=1', async () => {
    const seen: URL[] = [];
    server.use(
      http.get(baseUrl + '/rules/es/events_tail/', ({ request }) => {
        seen.push(new URL(request.url));
        return HttpResponse.json(emptyPaginated);
      }),
    );

    await renderBadge('192.168.1.5');

    await waitFor(() => {
      expect(seen.length).toBeGreaterThanOrEqual(1);
    });
    const qfilter = seen[0].searchParams.get('qfilter') ?? '';
    expect(qfilter).toContain('src_ip:"192.168.1.5"');
    expect(qfilter).toContain('dest_ip:"192.168.1.5"');
    expect(qfilter).toContain('event_type:fileinfo');
    expect(seen[0].searchParams.get('page_size')).toBe('1');
  });

  it('renders the returned count', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/events_tail/', () =>
        HttpResponse.json({ ...emptyPaginated, count: 42 }),
      ),
    );

    await renderBadge('192.168.1.5');

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });
});
