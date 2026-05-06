import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  closeQfilterModal,
  openAddEsFilter,
  openAddFilter,
  selectQfilterModalKind,
} from '../state/qfilter-modal.slice';

export const useQfilterModal = () => {
  const dispatch = useAppDispatch();
  const kind = useAppSelector(selectQfilterModalKind);

  return {
    kind,
    openAddFilter: () => dispatch(openAddFilter()),
    openAddEsFilter: () => dispatch(openAddEsFilter()),
    close: () => dispatch(closeQfilterModal()),
  };
};
