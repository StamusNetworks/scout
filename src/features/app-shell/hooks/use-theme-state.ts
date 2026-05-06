import { useAppDispatch, useAppSelector } from '@/store/store';

import { setTheme, type Theme } from '../state/ui-state.slice';

const selectTheme = (state: { uiState: { theme: Theme } }) =>
  state.uiState.theme;

export const useThemeState = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  return {
    theme,
    setTheme: (next: Theme) => dispatch(setTheme(next)),
  };
};
