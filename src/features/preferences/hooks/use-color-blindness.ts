import { useAppSelector } from '@/store/store';

import { selectColorBlindness } from '../state/preferences.slice';

export const useColorBlindness = () => useAppSelector(selectColorBlindness);
