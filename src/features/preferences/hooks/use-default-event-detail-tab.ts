import { useAppSelector } from '@/store/store';

import { selectDefaultEventDetailTab } from '../state/preferences.slice';

export const useDefaultEventDetailTab = () =>
  useAppSelector(selectDefaultEventDetailTab);
