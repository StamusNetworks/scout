import { useCallback } from 'react';

import { type QueryFilterState } from '@/features/query-filters';
import { useAppDispatch } from '@/store/store';

import {
  closeSaveFilterSetModal,
  openSaveFilterSetModal,
} from '../state/save-filter-set.slice';

type OpenPayload =
  | { mode: 'fromFilterAction'; filters: QueryFilterState[] }
  | undefined;

/**
 * Public surface for opening/closing the save-filter-set modal.
 * Wraps the slice actions so consumers don't reach into `state/`.
 */
export const useSaveFilterSetModal = () => {
  const dispatch = useAppDispatch();

  const open = useCallback(
    (payload?: OpenPayload) => dispatch(openSaveFilterSetModal(payload)),
    [dispatch],
  );

  const close = useCallback(
    () => dispatch(closeSaveFilterSetModal()),
    [dispatch],
  );

  return { open, close };
};
