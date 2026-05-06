import { useAppSelector } from '@/store/store';

import { selectAutoOpenSidebarOnNavigation } from '../state/preferences.slice';

export const useAutoOpenSidebarOnNavigation = () =>
  useAppSelector(selectAutoOpenSidebarOnNavigation);
