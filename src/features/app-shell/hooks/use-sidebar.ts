import { useAppDispatch, useAppSelector } from '@/store/store';

import { selectIsSidebarOpen, setIsSidebarOpen } from '../state/ui-state.slice';

export const useSidebar = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsSidebarOpen);
  return {
    isOpen,
    setOpen: (next: boolean) => dispatch(setIsSidebarOpen(next)),
    toggle: () => dispatch(setIsSidebarOpen(!isOpen)),
  };
};
