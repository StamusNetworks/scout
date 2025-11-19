import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/common/testing/test-utils';
import * as ThreatsAPI from '@/features/hunt/threats/api/threats.api';
import * as NewsAPI from '@/features/marketing/api/news.api';
import { API } from '@/store/api';
import * as AppStore from '@/store/store';
import { initialState } from '@/store/store.init';

import { Header } from './header';

describe('Header', () => {
  beforeEach(() => {
    // Mock the news API queries to prevent them from running during tests
    vi.spyOn(NewsAPI, 'useGetEENewsFeedQuery').mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    } as any);
    vi.spyOn(NewsAPI, 'useGetCENewsFeedQuery').mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    } as any);
  });

  test('Should dispatch the API reload', async () => {
    const dispatch = vi.fn();
    vi.spyOn(AppStore, 'useAppDispatch').mockReturnValue(dispatch);
    renderWithProviders(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByTestId('reload-button'));

    expect(dispatch).toHaveBeenCalledWith(API.util.invalidateTags(['Reload']));
  });
  test('Should pre fetch the threats', async () => {
    const useGetThreatsQuery = vi.spyOn(ThreatsAPI, 'useGetSTIThreatsQuery');
    renderWithProviders(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
      {
        preloadedState: {
          ...initialState,
          filters: {
            ...initialState.filters,
            tenancy: {
              ...initialState.filters.tenancy,
              multitenancy: true,
              tenant: 4,
            },
          },
        },
      },
    );

    expect(useGetThreatsQuery).toHaveBeenCalled();
  });
});
