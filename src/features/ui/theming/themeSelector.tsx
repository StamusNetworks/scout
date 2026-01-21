import { CheckIcon, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/common/design-system/atoms/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/common/design-system/atoms/ui/dropdown-menu';
import { useAppDispatch } from '@/store/store';

import { setTheme, Theme } from '../ui-state.slice';
import { useTheme } from './useTheme';

export const ThemeSelector = () => {
  const { theme, colorBlindness } = useTheme();

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove(
      'light',
      'dark',
      'catppuccin',
      'diesel',
      'matrix',
      'system',
    );

    if (['catppuccin', 'diesel', 'matrix', 'dark'].includes(theme)) {
      root.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    }

    if (theme !== 'system') {
      root.classList.add(theme);
    }
  }, [theme]);

  usePreferredColorTheme(theme === 'system');

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
          variant="ghost"
          size="icon-sm"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ThemeOption
          theme="system"
          label="System"
          selected={theme === 'system'}
        />
        <DropdownMenuSeparator />
        <ThemeOption
          theme="light"
          label="Light"
          selected={theme === 'light'}
        />
        <ThemeOption
          theme="diesel"
          label="Dark"
          selected={theme === 'diesel'}
        />
        <ThemeOption
          theme="dark"
          label="Darker"
          selected={theme === 'dark'}
        />
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Other options</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <ThemeOption
              theme="matrix"
              label="Matrix"
              selected={theme === 'matrix'}
            />
            <ThemeOption
              theme="catppuccin"
              label="Catppuccin"
              selected={theme === 'catppuccin'}
            />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ThemeOption = ({
  theme,
  label,
  selected,
}: {
  theme: Theme;
  label: string;
  selected: boolean;
}) => {
  const dispatch = useAppDispatch();
  return (
    <DropdownMenuItem
      key={theme}
      onClick={() => dispatch(setTheme(theme))}
      className="flex items-center justify-between"
    >
      <span>{label}</span>
      {selected && <CheckIcon className="text-muted-foreground h-4 w-4" />}
    </DropdownMenuItem>
  );
};

export const useGetPreferredColorScheme = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const [preferredColorScheme, setPreferredColorScheme] = useState(
    mediaQuery.matches ? 'dark' : 'light',
  );

  // observe the media query to change the returned value if the OS changes
  useEffect(() => {
    const handler = (event: MediaQueryListEvent) => {
      setPreferredColorScheme(event.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [mediaQuery]);

  return preferredColorScheme;
};

const usePreferredColorTheme = (isSystem: boolean) => {
  const preferredColorScheme = useGetPreferredColorScheme();

  useEffect(() => {
    if (!isSystem) return;

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'diesel');

    if (preferredColorScheme === 'dark') {
      root.classList.add('dark');
      root.classList.add('diesel');
    } else {
      root.classList.add('light');
    }
  }, [preferredColorScheme, isSystem]);
};
