import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, test } from 'vitest';

import { renderWithProviders } from '@/common/testing/test-utils';
import { selectQueryFilters } from '@/features/hunt/filtering/query-filters/store/query-filters.selector';

import { routes } from '../routes.config';
import { Deeplink } from './index';

const LocationDisplay = () => {
  const location = useLocation();
  return (
    <div data-testid="location-display">{`${location.pathname}${location.search}`}</div>
  );
};

describe('Deeplink', () => {
  test('dispatches filters and navigates to the requested page', async () => {
    const { store } = renderWithProviders(
      <MemoryRouter
        initialEntries={['/deeplink?page=events&ip=1.2.3.4&port="80"&tag=test']}
      >
        <Routes>
          <Route
            path="/deeplink"
            element={<Deeplink />}
          />
          <Route
            path="*"
            element={<LocationDisplay />}
          />
        </Routes>
      </MemoryRouter>,
    );

    const locationDisplay = await screen.findByTestId('location-display');
    expect(locationDisplay).toHaveTextContent(routes.events);
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
    renderWithProviders(
      <MemoryRouter initialEntries={['/deeplink?ip=1.2.3.4']}>
        <Routes>
          <Route
            path="/deeplink"
            element={<Deeplink />}
          />
          <Route
            path="*"
            element={<LocationDisplay />}
          />
        </Routes>
      </MemoryRouter>,
    );

    const locationDisplay = await screen.findByTestId('location-display');
    expect(locationDisplay).toHaveTextContent(routes.explorer);
  });
});
