import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { beforeEach, describe, expect, test } from 'vitest';

import { mockNavigate } from '@/common/testing/mocks/hooks/use-navigate.mock';
import { renderWithProviders, withoutIds } from '@/common/testing/test-utils';
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
    const queryFilters = store.getState().filters.queryFilters.queryFilters;
    expect(withoutIds(queryFilters)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'src_ip',
          value: '10.0.0.1',
          isNegated: false,
          isWildcarded: false,
        }),
        expect.objectContaining({
          key: 'msg',
          value: 'test',
          isNegated: true,
          isWildcarded: true,
        }),
      ]),
    );

    // Verify flag filters match the decoded tags (nested domain shape).
    const { flags } = store.getState().filters.queryFilters;
    expect(flags).toEqual({
      eventTypes: {
        alert: SHARED_STATE.tags.alert,
        stamus: SHARED_STATE.tags.stamus,
        discovery: SHARED_STATE.tags.discovery,
      },
      alertTags: {
        relevant: SHARED_STATE.tags.relevant,
        informational: SHARED_STATE.tags.informational,
        untagged: SHARED_STATE.tags.untagged,
      },
      novelty: SHARED_STATE.tags.novelty,
    });

    // Verify dates match the decoded time
    const dates = store.getState().filters.datesFilters;
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
