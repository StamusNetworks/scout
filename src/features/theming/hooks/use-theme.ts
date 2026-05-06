import { useMemo } from 'react';

import { useColorBlindness } from '@/features/preferences';
import { RootState, useAppSelector } from '@/store/store';

const selectTheme = (state: RootState) => state.uiState.theme;

export const useTheme = () => {
  const theme = useAppSelector(selectTheme);
  const colorBlindness = useColorBlindness();
  const isDark = theme === 'light' ? false : true;
  return useMemo(
    () => ({ theme, colorBlindness, isDark }),
    [theme, isDark, colorBlindness],
  );
};
