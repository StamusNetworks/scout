import { renderHook } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/rules', () => ({
  useGetRulesQuery: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
  })),
}));

import { useGetRulesQuery } from '@/features/rules';
import { setupStore } from '@/store/store';
import { initialState } from '@/store/store.init';

import { useFamilyDetectionMethods } from './use-family-detection-methods';

describe('useFamilyDetectionMethods', () => {
  it('forwards page and pageSize to useGetRulesQuery', () => {
    const store = setupStore(initialState);
    const wrapper = ({ children }: PropsWithChildren) => (
      <Provider store={store}>{children}</Provider>
    );
    renderHook(
      () => useFamilyDetectionMethods({ familyId: '9', page: 2, pageSize: 10 }),
      { wrapper },
    );
    expect(useGetRulesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, pageSize: 10 }),
      expect.anything(),
    );
  });
});
