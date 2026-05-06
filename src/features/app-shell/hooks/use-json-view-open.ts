import { useAppDispatch, useAppSelector } from '@/store/store';

import { selectJsonViewOpen, setJsonViewOpen } from '../state/ui-state.slice';

export const useJsonViewOpen = () => {
  const dispatch = useAppDispatch();
  const value = useAppSelector(selectJsonViewOpen);
  return {
    value,
    setValue: (next: number) => dispatch(setJsonViewOpen(next)),
  };
};
