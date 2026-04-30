import ReactJson, { type ThemeKeys } from '@microlink/react-json-view';
import { useMemo } from 'react';

import { useGetPreferredColorScheme } from '@/features/ui/theming/themeSelector';
import { useTheme } from '@/features/ui/theming/useTheme';
import { BaseTheme, selectJsonViewOpen } from '@/features/ui/ui-state.slice';
import { useAppSelector } from '@/store/store';

const ThemesMap = {
  light: 'bright:inverted',
  dark: 'chalk',
  catppuccin: 'ashes',
  diesel: 'chalk',
  matrix: 'chalk',
} satisfies Record<BaseTheme, ThemeKeys>;

export const JsonView = ({
  data,
  name = false,
  displayDataTypes = false,
  displayObjectSize = false,
  collapseStringsAfterLength = 200,
  collapsed,
}: {
  data: object;
  name?: string | false | null | undefined;
  displayDataTypes?: boolean;
  displayObjectSize?: boolean;
  collapseStringsAfterLength?: number | false | undefined;
  collapsed?: number | boolean | undefined;
}) => {
  const { theme } = useTheme();
  const pref = useGetPreferredColorScheme();
  const defaultOpen = useAppSelector(selectJsonViewOpen);
  const jsonTheme = useMemo(() => {
    if (theme === 'system') {
      return ThemesMap[pref === 'dark' ? 'diesel' : 'light'];
    }
    return ThemesMap[theme];
  }, [pref, theme]);
  return (
    <ReactJson
      name={name}
      src={data}
      displayDataTypes={displayDataTypes}
      displayObjectSize={displayObjectSize}
      collapseStringsAfterLength={collapseStringsAfterLength}
      collapsed={collapsed ?? defaultOpen}
      theme={jsonTheme}
      style={{ backgroundColor: 'transparent', wordBreak: 'break-all' }}
      enableClipboard={true}
    />
  );
};
