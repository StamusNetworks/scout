import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { beforeEach, describe, expect, test } from 'vitest';

import { mockNavigate } from '@/common/testing/mocks/hooks/use-navigate.mock';
import { renderWithProviders, withoutIds } from '@/common/testing/test-utils';
import { selectDates } from '@/features/filtering/dates/dates.selectors';
import { selectQueryFilters } from '@/features/filtering/query-filters/store/query-filters.selector';
import {
  encodeShareableState,
  type ShareableState,
} from '@/features/ui/share/shareable-state';
import { initialState } from '@/store/store.init';

import { SharePage } from './share';

const SHARED_STATE: ShareableState = {
  route: '/hosts/42/incidents',
  tenant: 4,
  time: { type: 'from', duration: 7, unit: 'days' },
  tags: {
    alert: true,
    stamus: false,
    discovery: true,
    relevant: true,
    informational: false,
    untagged: true,
    novelty: true,
  },
  filters: [
    { key: 'src_ip', value: '10.0.0.1' },
    { key: 'msg', value: 'test', negated: true },
  ],
};

const renderSharePage = async (
  search: string,
  {
    preloadedState = initialState,
  }: { preloadedState?: typeof initialState } = {},
) => {
  // SharePage reads from window.location.search, so set the browser URL.
  // happy-dom doesn't update location on pushState, so assign href directly.
  window.location.href = `http://localhost/share${search}`;

  return renderWithProviders(<SharePage />, {
    router: createRouter({
      routeTree: createRootRoute(),
      history: createMemoryHistory({
        initialEntries: [`/share${search}`],
      }),
    }),
    preloadedState,
  });
};

describe('SharePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('decodes state and navigates to target route', async () => {
    const encoded = encodeShareableState(SHARED_STATE);
    const { store } = await renderSharePage(`?s=${encoded}`);
    expect(mockNavigate).toHaveBeenCalledWith({
      to: SHARED_STATE.route,
      replace: true,
    });

    // Verify query filters were hydrated with correct flags
    const queryFilters = selectQueryFilters(store.getState());
    expect(withoutIds(queryFilters)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'src_ip',
          value: '10.0.0.1',
          is_negated: false,
          is_wildcarded: false,
        }),
        expect.objectContaining({
          key: 'msg',
          value: 'test',
          is_negated: true,
          is_wildcarded: true,
        }),
      ]),
    );

    // Verify tag filters match the decoded tags
    const { tagFilters } = store.getState().filters.queryFilters;
    expect(tagFilters).toEqual(SHARED_STATE.tags);

    // Verify dates match the decoded time
    const dates = selectDates(store.getState());
    expect(dates).toEqual(
      expect.objectContaining({
        type: 'from',
        from_duration: 7,
        from_unit: 'days',
      }),
    );
  });

  test('navigates to operational center on missing s param', async () => {
    await renderSharePage('');
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/operational-center',
      replace: true,
    });
  });

  test('navigates to operational center on invalid s param', async () => {
    await renderSharePage('?s=garbage!!!');
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/operational-center',
      replace: true,
    });
  });

  test('navigates to explorer on missing s param in community mode', async () => {
    await renderSharePage('', {
      preloadedState: { ...initialState, settings: { enterprise: false } },
    });
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/explorer',
      replace: true,
    });
  });

  test('navigates to explorer on invalid s param in community mode', async () => {
    await renderSharePage('?s=garbage!!!', {
      preloadedState: { ...initialState, settings: { enterprise: false } },
    });
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/explorer',
      replace: true,
    });
  });

  test('preserves URL search params from shared route', async () => {
    const sharedState: ShareableState = {
      ...SHARED_STATE,
      route: '/hosts/42/incidents?page=3&sort=desc',
    };
    const encoded = encodeShareableState(sharedState);
    await renderSharePage(`?s=${encoded}`);
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/hosts/42/incidents?page=3&sort=desc',
      replace: true,
    });
  });
});
