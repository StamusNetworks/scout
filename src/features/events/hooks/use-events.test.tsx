import { renderHook } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../api/events.api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/events.api')>();
  return {
    ...actual,
    useGetEventsQuery: vi.fn(() => ({
      data: undefined,
      isLoading: false,
      isFetching: false,
    })),
  };
});

import { setupStore } from '@/store/store';
import { initialState } from '@/store/store.init';

import { useGetEventsQuery } from '../api/events.api';
import { useEvents } from './use-events';

const renderUseEvents = (page: number, pageSize: number) => {
  const store = setupStore(initialState);
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(() => useEvents({ page, pageSize }), { wrapper });
};

describe('useEvents', () => {
  it('forwards page and pageSize to useGetEventsQuery', () => {
    renderUseEvents(2, 25);
    expect(useGetEventsQuery).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, pageSize: 25 }),
    );
  });
});
