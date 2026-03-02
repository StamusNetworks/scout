import type { OnChangeFn, PaginationState, SortingState, Updater } from '@tanstack/react-table';

export type ServerTableStateOptions = {
  defaultPageSize?: number;
};

export type ServerTableState<TParams> = {
  queryParams: TParams & {
    pageIndex: number;
    pageSize: number;
    ordering?: string;
  };
  pagination: PaginationState;
  setPagination: (updater: Updater<PaginationState>) => void;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
};

export function useServerTableState<TParams extends Record<string, unknown>>(
  _params: TParams,
  _options?: ServerTableStateOptions,
): ServerTableState<TParams> {
  throw new Error('Not implemented');
}
