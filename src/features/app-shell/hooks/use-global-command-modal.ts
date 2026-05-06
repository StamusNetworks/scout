import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  selectIsGlobalCommandOpen,
  setIsGlobalCommandOpen,
  toggleGlobalCommand,
} from '../state/ui-state.slice';

export const useGlobalCommandModal = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsGlobalCommandOpen);

  return {
    isOpen,
    open: () => dispatch(setIsGlobalCommandOpen(true)),
    close: () => dispatch(setIsGlobalCommandOpen(false)),
    toggle: () => dispatch(toggleGlobalCommand()),
    setOpen: (next: boolean) => dispatch(setIsGlobalCommandOpen(next)),
  };
};
