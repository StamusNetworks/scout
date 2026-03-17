import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePaginatedSearch } from './use-paginated-search';

function makeParams(search: Record<string, unknown>) {
  const navigate = vi.fn();
  const params = { search, navigate };
  return { params, navigate };
}

describe('usePaginatedSearch', () => {
  describe('reading from search params', () => {
    it('returns page and pageSize from search params', () => {
      const { params } = makeParams({ page: 3, page_size: 25 });
      const { result } = renderHook(() =>
        usePaginatedSearch(params, { resetOn: ['tenant-1'] }),
      );

      expect(result.current.page).toBe(3);
      expect(result.current.pageSize).toBe(25);
    });

    it('defaults page to 1 when not present in search', () => {
      const { params } = makeParams({});
      const { result } = renderHook(() =>
        usePaginatedSearch(params, { resetOn: [] }),
      );

      expect(result.current.page).toBe(1);
    });

    it('defaults pageSize to 10 when not present in search', () => {
      const { params } = makeParams({});
      const { result } = renderHook(() =>
        usePaginatedSearch(params, { resetOn: [] }),
      );

      expect(result.current.pageSize).toBe(10);
    });

    it('uses custom defaultPageSize when provided', () => {
      const { params } = makeParams({});
      const { result } = renderHook(() =>
        usePaginatedSearch(params, { resetOn: [], defaultPageSize: 50 }),
      );

      expect(result.current.pageSize).toBe(50);
    });

    it('parses sorting from sort string (descending)', () => {
      const { params } = makeParams({ sort: '-timestamp' });
      const { result } = renderHook(() =>
        usePaginatedSearch(params, { resetOn: [] }),
      );

      expect(result.current.sorting).toEqual([{ id: 'timestamp', desc: true }]);
    });

    it('parses sorting from sort string (ascending)', () => {
      const { params } = makeParams({ sort: 'timestamp' });
      const { result } = renderHook(() =>
        usePaginatedSearch(params, { resetOn: [] }),
      );

      expect(result.current.sorting).toEqual([
        { id: 'timestamp', desc: false },
      ]);
    });

    it('returns empty sorting when sort is not present', () => {
      const { params } = makeParams({});
      const { result } = renderHook(() =>
        usePaginatedSearch(params, { resetOn: [] }),
      );

      expect(result.current.sorting).toEqual([]);
    });
  });

  describe('page reset on resetOn change', () => {
    it('resets page to 1 when resetOn deps change', () => {
      let resetOn = ['tenant-1'];
      const search: Record<string, unknown> = { page: 3, page_size: 10 };
      const navigate = vi.fn();
      const params = { search, navigate };

      const { result, rerender } = renderHook(() =>
        usePaginatedSearch(params, { resetOn }),
      );

      expect(result.current.page).toBe(3);

      // Change a dep value
      resetOn = ['tenant-2'];
      rerender();

      expect(result.current.page).toBe(1);
    });

    it('calls navigate with replace: true when resetting page', () => {
      let resetOn = ['tenant-1'];
      const search: Record<string, unknown> = { page: 3, page_size: 10 };
      const navigate = vi.fn();
      const params = { search, navigate };

      const { rerender } = renderHook(() =>
        usePaginatedSearch(params, { resetOn }),
      );

      resetOn = ['tenant-2'];
      rerender();

      expect(navigate).toHaveBeenCalledWith(
        expect.objectContaining({ replace: true }),
      );
      const searchFn = navigate.mock.calls[0][0].search;
      expect(searchFn({ page: 3, page_size: 10 })).toEqual({
        page: 1,
        page_size: 10,
      });
    });

    it('does not call navigate when already on page 1 and deps change', () => {
      let resetOn = ['tenant-1'];
      const search: Record<string, unknown> = { page: 1, page_size: 10 };
      const navigate = vi.fn();
      const params = { search, navigate };

      const { rerender } = renderHook(() =>
        usePaginatedSearch(params, { resetOn }),
      );

      resetOn = ['tenant-2'];
      rerender();

      // Already on page 1, no navigate needed
      expect(navigate).not.toHaveBeenCalled();
    });

    it('does NOT reset page when resetOn deps are the same values in a new array', () => {
      let resetOn = ['tenant-1', 'filter-abc'];
      const search: Record<string, unknown> = { page: 3, page_size: 10 };
      const navigate = vi.fn();
      const params = { search, navigate };

      const { result, rerender } = renderHook(() =>
        usePaginatedSearch(params, { resetOn }),
      );

      expect(result.current.page).toBe(3);

      // New array reference, same values
      resetOn = ['tenant-1', 'filter-abc'];
      rerender();

      expect(result.current.page).toBe(3);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('does NOT reset page on first render', () => {
      const { params, navigate } = makeParams({ page: 5, page_size: 10 });
      const { result } = renderHook(() =>
        usePaginatedSearch(params, { resetOn: ['tenant-1'] }),
      );

      expect(result.current.page).toBe(5);
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('setPage', () => {
    it('calls navigate with updated page', () => {
      const { params, navigate } = makeParams({ page: 1, page_size: 10 });
      const { result } = renderHook(() =>
        usePaginatedSearch(params, { resetOn: [] }),
      );

      act(() => {
        result.current.setPage(4);
      });

      expect(navigate).toHaveBeenCalledOnce();
      const searchFn = navigate.mock.calls[0][0].search;
      expect(searchFn({ page: 1, page_size: 10 })).toEqual({
        page: 4,
        page_size: 10,
      });
    });
  });

  describe('setPageSize', () => {
    it('calls navigate with updated page_size and resets page to 1', () => {
      const { params, navigate } = makeParams({ page: 3, page_size: 10 });
      const { result } = renderHook(() =>
        usePaginatedSearch(params, { resetOn: [] }),
      );

      act(() => {
        result.current.setPageSize(25);
      });

      expect(navigate).toHaveBeenCalledOnce();
      const searchFn = navigate.mock.calls[0][0].search;
      expect(searchFn({ page: 3, page_size: 10 })).toEqual({
        page: 1,
        page_size: 25,
      });
    });
  });

  describe('setSorting', () => {
    it('calls navigate with serialized sort and resets page to 1', () => {
      const { params, navigate } = makeParams({ page: 3, page_size: 10 });
      const { result } = renderHook(() =>
        usePaginatedSearch(params, { resetOn: [] }),
      );

      act(() => {
        result.current.setSorting([{ id: 'timestamp', desc: true }]);
      });

      expect(navigate).toHaveBeenCalledOnce();
      const searchFn = navigate.mock.calls[0][0].search;
      expect(searchFn({ page: 3, page_size: 10 })).toEqual({
        page: 1,
        page_size: 10,
        sort: '-timestamp',
      });
    });

    it('calls navigate with undefined sort when sorting is empty', () => {
      const { params, navigate } = makeParams({
        page: 1,
        page_size: 10,
        sort: '-timestamp',
      });
      const { result } = renderHook(() =>
        usePaginatedSearch(params, { resetOn: [] }),
      );

      act(() => {
        result.current.setSorting([]);
      });

      const searchFn = navigate.mock.calls[0][0].search;
      expect(searchFn({ page: 1, page_size: 10, sort: '-timestamp' })).toEqual({
        page: 1,
        page_size: 10,
        sort: undefined,
      });
    });
  });
});
