import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { mockNavigate } from '@/common/testing/mocks/hooks/use-navigate.mock';
import { renderWithProviders, withoutIds } from '@/common/testing/test-utils';
import { selectQueryFilters } from '@/features/query-filters/state/query-filters.selectors';
import { initialState } from '@/store/store.init';

import { useApplyDeeplink } from './use-apply-deeplink';

const TestHarness = () => {
  useApplyDeeplink();
  return null;
};

const renderDeeplink = (
  search: string,
  { preloadedState }: { preloadedState?: typeof initialState } = {},
) => {
  // useApplyDeeplink reads from window.location.search.
  // happy-dom doesn't update location on pushState, so assign href directly.
  window.location.href = `http://localhost/deeplink${search}`;
  return renderWithProviders(<TestHarness />, { preloadedState });
};

describe('useApplyDeeplink', () => {
  let toastSuccessSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockNavigate.mockClear();
    toastSuccessSpy = vi.spyOn(toast, 'success').mockImplementation(() => '');
  });

  afterEach(() => {
    toastSuccessSpy.mockRestore();
    // happy-dom keeps window.location across tests; reset so order doesn't matter.
    window.location.href = 'http://localhost/';
  });

  // `tag` is intentionally NOT in AUTHORIZE_MULTIPLE_FILTERS — the prior bug
  // only surfaced for non-allowlisted keys, so this regression guard must use
  // a non-allowlisted key to be meaningful.
  test('materializes repeated same-key params as active filters in URL order', async () => {
    const { store } = await renderDeeplink('?page=events&tag=a&tag=b');

    const filters = selectQueryFilters(store.getState());
    expect(withoutIds(filters)).toEqual([
      expect.objectContaining({
        key: 'tag',
        value: 'a',
        isSuspended: false,
        isNegated: false,
        isWildcarded: false,
      }),
      expect.objectContaining({
        key: 'tag',
        value: 'b',
        isSuspended: false,
        isNegated: false,
        isWildcarded: false,
      }),
    ]);
  });

  test.each([
    ['events', '/detection-events'],
    ['dashboard', '/explorer'],
    ['detection_methods', '/detection-methods'],
    ['hosts', '/hosts'],
    ['inventory', '/attack-surface/inventory'],
  ])('navigates to the pivot route for page=%s', async (page, expectedTo) => {
    await renderDeeplink(`?page=${page}`);
    expect(mockNavigate).toHaveBeenCalledWith({
      to: expectedTo,
      replace: true,
    });
  });

  test('falls back to /explorer when page is missing', async () => {
    await renderDeeplink('?tag=a');
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/explorer',
      replace: true,
    });
  });

  test('falls back to /explorer when page is unknown', async () => {
    await renderDeeplink('?page=not-a-real-page&tag=a');
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/explorer',
      replace: true,
    });
  });

  test('emits no toast on deeplink load', async () => {
    // Deeplink hydration is programmatic navigation — the user did not ask
    // for a clear, so the clearFilters call passes showToast: false.
    await renderDeeplink('?page=events&ip=1.2.3.4&port=80&tag=a');
    expect(toastSuccessSpy).not.toHaveBeenCalled();
  });

  test('drops pre-existing filters when applying a deeplink', async () => {
    // Simulates a real user flow: filters are already in state from a prior
    // route, then the user clicks a deeplink. The deeplink must replace the
    // prior filters, not stack on top of them as suspended entries.
    const preloadedState: typeof initialState = {
      ...initialState,
      filters: {
        ...initialState.filters,
        queryFilters: {
          ...initialState.filters.queryFilters,
          queryFilters: [
            {
              id: 'prior-1',
              key: 'src_ip',
              value: '10.0.0.1',
              isSuspended: false,
              isNegated: false,
              isWildcarded: false,
            },
          ],
        },
      },
    };

    const { store } = await renderDeeplink('?page=events&tag=new', {
      preloadedState,
    });

    const filters = selectQueryFilters(store.getState());
    expect(withoutIds(filters)).toEqual([
      expect.objectContaining({
        key: 'tag',
        value: 'new',
        isSuspended: false,
      }),
    ]);
  });

  test('collapses literal duplicate params into a single active filter', async () => {
    const { store } = await renderDeeplink('?page=events&tag=a&tag=a');

    const filters = selectQueryFilters(store.getState());
    expect(withoutIds(filters)).toEqual([
      expect.objectContaining({
        key: 'tag',
        value: 'a',
        isSuspended: false,
      }),
    ]);
  });

  test('materializes distinct-key filters with value coercion', async () => {
    const { store } = await renderDeeplink(
      '?page=events&ip=1.2.3.4&port="80"&tag=test',
    );

    const filters = selectQueryFilters(store.getState());
    expect(withoutIds(filters)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'ip',
          value: '1.2.3.4',
          isSuspended: false,
          isNegated: false,
          isWildcarded: false,
        }),
        expect.objectContaining({
          key: 'port',
          value: 80,
          isSuspended: false,
          isNegated: false,
          isWildcarded: false,
        }),
        expect.objectContaining({
          key: 'tag',
          value: 'test',
          isSuspended: false,
          isNegated: false,
          isWildcarded: false,
        }),
      ]),
    );
    expect(filters).toHaveLength(3);
  });
});
