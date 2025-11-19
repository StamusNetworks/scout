import { useMemo } from 'react';

import { RootState, useAppSelector } from '@/store/store';

import { selectColorBlindness } from '../preferences/preferences.slice';

const selectTheme = (state: RootState) => state.uiState.theme;

export const useTheme = () => {
  const theme = useAppSelector(selectTheme);
  const colorBlindness = useAppSelector(selectColorBlindness);
  const isDark = theme === 'light' ? false : true;
  return useMemo(
    () => ({ theme, colorBlindness, isDark }),
    [theme, isDark, colorBlindness],
  );
};
