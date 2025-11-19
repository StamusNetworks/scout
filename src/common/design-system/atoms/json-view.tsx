import ReactJson, { type ThemeKeys } from 'react-json-view';

import { useTheme } from '@/features/ui/theming/useTheme';
import { selectJsonViewOpen, Theme } from '@/features/ui/ui-state.slice';
import { useAppSelector } from '@/store/store';

const ThemesMap = {
  light: 'bright:inverted',
  dark: 'chalk',
  catppuccin: 'ashes',
  diesel: 'chalk',
  matrix: 'chalk',
} satisfies Record<Theme, ThemeKeys>;

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
  const defaultOpen = useAppSelector(selectJsonViewOpen);
  return (
    <ReactJson
      name={name}
      src={data}
      displayDataTypes={displayDataTypes}
      displayObjectSize={displayObjectSize}
      collapseStringsAfterLength={collapseStringsAfterLength}
      collapsed={collapsed ?? defaultOpen}
      theme={ThemesMap[theme]}
      style={{ backgroundColor: 'transparent', wordBreak: 'break-all' }}
      enableClipboard={true}
    />
  );
};
