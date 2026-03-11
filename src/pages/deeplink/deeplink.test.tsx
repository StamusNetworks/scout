import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { describe, expect, test } from 'vitest';

import { renderWithProviders } from '@/common/testing/test-utils';
import { selectQueryFilters } from '@/features/hunt/filtering/query-filters/store/query-filters.selector';

import { Deeplink } from './index';

describe('Deeplink', () => {
  test('dispatches filters and navigates to the requested page', async () => {
    // Deeplink reads from window.location.search
    // happy-dom doesn't update location on pushState, so assign href directly.
    window.location.href =
      'http://localhost/deeplink?page=events&ip=1.2.3.4&port="80"&tag=test';

    const { store } = await renderWithProviders(<Deeplink />, {
      router: createRouter({
        routeTree: createRootRoute(),
        history: createMemoryHistory({
          initialEntries: [
            '/deeplink?page=events&ip=1.2.3.4&port="80"&tag=test',
          ],
        }),
      }),
    });

    expect(selectQueryFilters(store.getState())).toHaveLength(3);
    expect(selectQueryFilters(store.getState())).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'ip',
          value: '1.2.3.4',
          is_suspended: false,
          is_negated: false,
          is_wildcarded: false,
        }),
        expect.objectContaining({
          key: 'port',
          value: 80,
          is_suspended: false,
          is_negated: false,
          is_wildcarded: false,
        }),
        expect.objectContaining({
          key: 'tag',
          value: 'test',
          is_suspended: false,
          is_negated: false,
          is_wildcarded: false,
        }),
      ]),
    );
  });

  test('falls back to the dashboard when page is missing', async () => {
    window.location.href = 'http://localhost/deeplink?ip=1.2.3.4';

    await renderWithProviders(<Deeplink />, {
      router: createRouter({
        routeTree: createRootRoute(),
        history: createMemoryHistory({
          initialEntries: ['/deeplink?ip=1.2.3.4'],
        }),
      }),
    });
  });
});
