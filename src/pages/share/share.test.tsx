import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { renderWithProviders, withoutIds } from '@/common/testing/test-utils';
import { selectDates } from '@/features/hunt/filtering/dates-filters/dates-filters';
import { selectQueryFilters } from '@/features/hunt/filtering/query-filters/store/query-filters.selector';
import {
  encodeShareableState,
  type ShareableState,
} from '@/features/ui/share/shareable-state';
import { initialState } from '@/store/store.init';

import { SharePage } from './index';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

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

const renderSharePage = (
  search: string,
  {
    preloadedState = initialState,
  }: { preloadedState?: typeof initialState } = {},
) =>
  renderWithProviders(
    <MemoryRouter initialEntries={[`/share${search}`]}>
      <SharePage />
    </MemoryRouter>,
    { preloadedState },
  );

describe('SharePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('decodes state and navigates to target route', async () => {
    const encoded = encodeShareableState(SHARED_STATE);
    const { store } = renderSharePage(`?s=${encoded}`);
    expect(mockNavigate).toHaveBeenCalledWith(SHARED_STATE.route, {
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
          is_wildcarded: false,
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

  test('navigates to operational center on missing s param', () => {
    renderSharePage('');
    expect(mockNavigate).toHaveBeenCalledWith('/operational-center', {
      replace: true,
    });
  });

  test('navigates to operational center on invalid s param', () => {
    renderSharePage('?s=garbage!!!');
    expect(mockNavigate).toHaveBeenCalledWith('/operational-center', {
      replace: true,
    });
  });

  test('navigates to explorer on missing s param in community mode', () => {
    renderSharePage('', {
      preloadedState: { ...initialState, settings: { enterprise: false } },
    });
    expect(mockNavigate).toHaveBeenCalledWith('/explorer', { replace: true });
  });

  test('navigates to explorer on invalid s param in community mode', () => {
    renderSharePage('?s=garbage!!!', {
      preloadedState: { ...initialState, settings: { enterprise: false } },
    });
    expect(mockNavigate).toHaveBeenCalledWith('/explorer', { replace: true });
  });

  test('preserves URL search params from shared route', async () => {
    const sharedState: ShareableState = {
      ...SHARED_STATE,
      route: '/hosts/42/incidents?page=3&sort=desc',
    };
    const encoded = encodeShareableState(sharedState);
    renderSharePage(`?s=${encoded}`);
    expect(mockNavigate).toHaveBeenCalledWith(
      '/hosts/42/incidents?page=3&sort=desc',
      { replace: true },
    );
  });
});
