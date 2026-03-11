import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useServerTableState } from './use-server-table-state';

const defaultSearch = { page: 1, page_size: 10, sort: undefined };

describe('useServerTableState', () => {
  it('returns page 1 and empty sorting on initial render', () => {
    const navigate = vi.fn();
    const { result } = renderHook(() =>
      useServerTableState(defaultSearch, { tenant: 1 }, navigate),
    );

    expect(result.current.pagination).toEqual({ pageIndex: 0, pageSize: 10 });
    expect(result.current.sorting).toEqual([]);
    expect(result.current.queryParams).toEqual({
      tenant: 1,
      pageIndex: 0,
      pageSize: 10,
    });
  });

  it('reads page and page_size from search', () => {
    const navigate = vi.fn();
    const { result } = renderHook(() =>
      useServerTableState({ page: 3, page_size: 25, sort: undefined }, { tenant: 1 }, navigate),
    );

    expect(result.current.pagination).toEqual({ pageIndex: 2, pageSize: 25 });
    expect(result.current.queryParams.pageIndex).toBe(2);
    expect(result.current.queryParams.pageSize).toBe(25);
  });

  it('resets page to 1 when a param value changes', () => {
    const navigate = vi.fn();
    const { result, rerender } = renderHook(
      ({ search, params }) => useServerTableState(search, params, navigate),
      {
        initialProps: {
          search: { page: 3, page_size: 10, sort: undefined },
          params: { tenant: 1 },
        },
      },
    );

    expect(result.current.pagination.pageIndex).toBe(2);

    // Change tenant — page should reset
    rerender({
      search: { page: 3, page_size: 10, sort: undefined },
      params: { tenant: 2 },
    });

    expect(navigate).toHaveBeenCalledWith({
      search: expect.any(Function),
    });
    // The navigate function should produce page: 1
    const searchFn = navigate.mock.calls[0][0].search;
    expect(searchFn({ page: 3, page_size: 10 })).toEqual({ page: 1, page_size: 10 });
  });

  it('does NOT reset page when params are value-equal', () => {
    const navigate = vi.fn();
    const { rerender } = renderHook(
      ({ search, params }) => useServerTableState(search, params, navigate),
      {
        initialProps: {
          search: { page: 3, page_size: 10, sort: undefined },
          params: { tenant: 1, filter: 'abc' },
        },
      },
    );

    // Re-render with new object reference but same values
    rerender({
      search: { page: 3, page_size: 10, sort: undefined },
      params: { tenant: 1, filter: 'abc' },
    });

    expect(navigate).not.toHaveBeenCalled();
  });

  it('calls navigate with correct pagination update', () => {
    const navigate = vi.fn();
    const { result } = renderHook(() =>
      useServerTableState(defaultSearch, { tenant: 1 }, navigate),
    );

    act(() => {
      result.current.setPagination({ pageIndex: 2, pageSize: 10 });
    });

    expect(navigate).toHaveBeenCalledWith({ search: expect.any(Function) });
    const searchFn = navigate.mock.calls[0][0].search;
    expect(searchFn({ page: 1, page_size: 10 })).toEqual({ page: 3, page_size: 10 });
  });

  it('calls navigate with correct sorting update', () => {
    const navigate = vi.fn();
    const { result } = renderHook(() =>
      useServerTableState(defaultSearch, { tenant: 1 }, navigate),
    );

    act(() => {
      result.current.setSorting([{ id: 'timestamp', desc: true }]);
    });

    expect(navigate).toHaveBeenCalledWith({ search: expect.any(Function) });
    const searchFn = navigate.mock.calls[0][0].search;
    expect(searchFn({ page: 1, page_size: 10 })).toEqual({
      page: 1,
      page_size: 10,
      sort: '-timestamp',
    });
  });

  it('includes ordering in queryParams when sorting is set', () => {
    const navigate = vi.fn();
    const { result } = renderHook(() =>
      useServerTableState({ page: 1, page_size: 10, sort: '-timestamp' }, { tenant: 1 }, navigate),
    );

    expect(result.current.queryParams.ordering).toBe('-timestamp');
    expect(result.current.sorting).toEqual([{ id: 'timestamp', desc: true }]);
  });

  it('omits ordering from queryParams when no sorting', () => {
    const navigate = vi.fn();
    const { result } = renderHook(() =>
      useServerTableState(defaultSearch, { tenant: 1 }, navigate),
    );

    expect(result.current.queryParams).not.toHaveProperty('ordering');
  });
});
