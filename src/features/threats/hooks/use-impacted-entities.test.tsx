import { renderHook } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../api/entities.api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/entities.api')>();
  return {
    ...actual,
    useGetImpactedEntitiesQuery: vi.fn(() => ({
      data: undefined,
      isLoading: false,
      isFetching: false,
    })),
  };
});

import { setupStore } from '@/store/store';
import { initialState } from '@/store/store.init';

import { useGetImpactedEntitiesQuery } from '../api/entities.api';
import { useImpactedEntities } from './use-impacted-entities';

describe('useImpactedEntities', () => {
  it('forwards page and pageSize to useGetImpactedEntitiesQuery', () => {
    const store = setupStore(initialState);
    const wrapper = ({ children }: PropsWithChildren) => (
      <Provider store={store}>{children}</Provider>
    );
    renderHook(() => useImpactedEntities({ page: 3, pageSize: 50 }), {
      wrapper,
    });
    expect(useGetImpactedEntitiesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ page: 3, pageSize: 50 }),
    );
  });
});
