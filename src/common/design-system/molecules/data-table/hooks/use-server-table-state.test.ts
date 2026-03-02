import { act, renderHook } from '@testing-library/react';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { describe, expect, it } from 'vitest';

import { useServerTableState } from './use-server-table-state';

const wrapper = (searchParams?: string) =>
  withNuqsTestingAdapter({ searchParams, hasMemory: true });

describe('useServerTableState', () => {
  it('returns page 1 and empty sorting on initial render', () => {
    const { result } = renderHook(
      () => useServerTableState({ tenant: 1 }),
      { wrapper: wrapper() },
    );

    expect(result.current.pagination).toEqual({ pageIndex: 0, pageSize: 10 });
    expect(result.current.sorting).toEqual([]);
    expect(result.current.queryParams).toEqual({
      tenant: 1,
      pageIndex: 0,
      pageSize: 10,
    });
  });

  it('respects defaultPageSize option', () => {
    const { result } = renderHook(
      () => useServerTableState({ tenant: 1 }, { defaultPageSize: 25 }),
      { wrapper: wrapper() },
    );

    expect(result.current.pagination.pageSize).toBe(25);
    expect(result.current.queryParams.pageSize).toBe(25);
  });

  it('resets page to 1 when a param value changes', () => {
    const { result, rerender } = renderHook(
      ({ params }) => useServerTableState(params),
      {
        wrapper: wrapper(),
        initialProps: { params: { tenant: 1 } },
      },
    );

    // Navigate to page 3
    act(() => {
      result.current.setPagination({ pageIndex: 2, pageSize: 10 });
    });
    expect(result.current.pagination.pageIndex).toBe(2);

    // Change tenant — page should reset to 0
    rerender({ params: { tenant: 2 } });
    expect(result.current.pagination.pageIndex).toBe(0);
    expect(result.current.queryParams.pageIndex).toBe(0);
  });

  it('resets page to 1 when a new param key appears', () => {
    const { result, rerender } = renderHook(
      ({ params }) => useServerTableState(params),
      {
        wrapper: wrapper(),
        initialProps: { params: { tenant: 1 } as Record<string, unknown> },
      },
    );

    act(() => {
      result.current.setPagination({ pageIndex: 2, pageSize: 10 });
    });

    rerender({ params: { tenant: 1, qfilter: 'src_ip:1.2.3.4' } });
    expect(result.current.pagination.pageIndex).toBe(0);
  });

  it('does NOT reset page when params are value-equal', () => {
    const { result, rerender } = renderHook(
      ({ params }) => useServerTableState(params),
      {
        wrapper: wrapper(),
        initialProps: { params: { tenant: 1, filter: 'abc' } },
      },
    );

    act(() => {
      result.current.setPagination({ pageIndex: 2, pageSize: 10 });
    });
    expect(result.current.pagination.pageIndex).toBe(2);

    // Re-render with new object reference but same values
    rerender({ params: { tenant: 1, filter: 'abc' } });
    expect(result.current.pagination.pageIndex).toBe(2);
  });

  it('resets page when sorting changes', () => {
    const { result } = renderHook(
      () => useServerTableState({ tenant: 1 }),
      { wrapper: wrapper() },
    );

    act(() => {
      result.current.setPagination({ pageIndex: 2, pageSize: 10 });
    });
    expect(result.current.pagination.pageIndex).toBe(2);

    // Change sorting
    act(() => {
      result.current.setSorting([{ id: 'timestamp', desc: true }]);
    });
    expect(result.current.pagination.pageIndex).toBe(0);
    expect(result.current.queryParams.ordering).toBe('-timestamp');
  });

  it('includes ordering in queryParams when sorting is set', () => {
    const { result } = renderHook(
      () => useServerTableState({ tenant: 1 }),
      { wrapper: wrapper('?sort=-timestamp') },
    );

    expect(result.current.queryParams.ordering).toBe('-timestamp');
    expect(result.current.sorting).toEqual([{ id: 'timestamp', desc: true }]);
  });

  it('omits ordering from queryParams when no sorting', () => {
    const { result } = renderHook(
      () => useServerTableState({ tenant: 1 }),
      { wrapper: wrapper() },
    );

    expect(result.current.queryParams).not.toHaveProperty('ordering');
  });

  it('reads initial page and page_size from URL', () => {
    const { result } = renderHook(
      () => useServerTableState({ tenant: 1 }),
      { wrapper: wrapper('?page=3&page_size=25') },
    );

    expect(result.current.pagination).toEqual({ pageIndex: 2, pageSize: 25 });
    expect(result.current.queryParams.pageIndex).toBe(2);
    expect(result.current.queryParams.pageSize).toBe(25);
  });
});
