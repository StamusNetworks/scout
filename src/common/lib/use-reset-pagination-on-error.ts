import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { PaginationState, Updater } from '@tanstack/react-table';
import { useEffect } from 'react';

export function useResetPaginationOnError(
  error: FetchBaseQueryError | SerializedError | undefined | unknown,
  setPagination: (updater: Updater<PaginationState>) => void,
) {
  useEffect(() => {
    if (
      error &&
      typeof error === 'object' &&
      'data' in error &&
      typeof error.data === 'object' &&
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      (error.data as any).message === 'invalid page'
    ) {
      setPagination((pagination) => ({
        ...pagination,
        pageIndex: 0,
      }));
    }
  }, [error, setPagination]);
}
