import { renderHook } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/events/api/events.api', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/events/api/events.api')>();
  return {
    ...actual,
    useGetEventsQuery: vi.fn(() => ({
      data: undefined,
      isLoading: false,
      isFetching: false,
    })),
  };
});

import { useGetEventsQuery } from '@/features/events/api/events.api';
import { setupStore } from '@/store/store';
import { initialState } from '@/store/store.init';

import { useFamilyEvents } from './use-family-events';

describe('useFamilyEvents', () => {
  it('forwards page and pageSize to useGetEventsQuery', () => {
    const store = setupStore(initialState);
    const wrapper = ({ children }: PropsWithChildren) => (
      <Provider store={store}>{children}</Provider>
    );
    renderHook(
      () => useFamilyEvents({ familyId: '9', page: 2, pageSize: 10 }),
      { wrapper },
    );
    expect(useGetEventsQuery).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, pageSize: 10 }),
      expect.anything(),
    );
  });
});
