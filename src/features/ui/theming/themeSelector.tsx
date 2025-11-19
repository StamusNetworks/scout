import { Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/common/design-system/atoms/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/common/design-system/atoms/ui/dropdown-menu';
import { useAppDispatch } from '@/store/store';

import { setTheme, Theme } from '../ui-state.slice';
import { useTheme } from './useTheme';

const themes = [
  {
    label: 'Light',
    value: 'light',
  },
  {
    label: 'Dark',
    value: 'diesel',
  },
  {
    label: 'Darker',
    value: 'dark',
  },
  {
    label: 'Matrix',
    value: 'matrix',
  },
  {
    label: 'Catpuccin',
    value: 'catppuccin',
  },
] satisfies { label: string; value: Theme }[];

export const ThemeSelector = () => {
  const dispatch = useAppDispatch();
  const { theme, colorBlindness } = useTheme();

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark', 'catppuccin', 'diesel', 'matrix');

    if (['catppuccin', 'diesel', 'matrix', 'dark'].includes(theme)) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('color-blind-prot-deut', 'color-blind-trit');
    if (colorBlindness === 'prot-deut') {
      root.classList.add('color-blind-prot-deut');
    } else if (colorBlindness === 'trit') {
      root.classList.add('color-blind-trit');
    }
  }, [colorBlindness]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => dispatch(setTheme(theme.value))}
          >
            {theme.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
