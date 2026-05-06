import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  selectAutoOpenSidebarOnFilterAdd,
  setAutoOpenSidebarOnFilterAdd,
} from '../state/ui-state.slice';

export const useAutoOpenSidebarOnFilterAdd = () => {
  const dispatch = useAppDispatch();
  const value = useAppSelector(selectAutoOpenSidebarOnFilterAdd);
  return {
    value,
    setValue: (next: boolean) => dispatch(setAutoOpenSidebarOnFilterAdd(next)),
  };
};
