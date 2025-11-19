import { ChevronsUpDown } from 'lucide-react';
import React from 'react';
import { Fragment } from 'react/jsx-runtime';

import { cn } from '@/common/lib/utils';

import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';

export type DropdownValue = {
  label: string;
  value: string;
  children?: undefined;
};

export type DropdownMenu = {
  label: string;
  value?: undefined;
  children: (DropdownValue | DropdownMenu)[];
};

interface DropdownSelectProps {
  options: DropdownMenu[];
  onChange: (value: string) => void;
  value: string | undefined;
}

export const DropdownSelect = React.forwardRef<
  HTMLButtonElement,
  DropdownSelectProps
>(({ options, onChange, value }, ref) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        ref={ref}
        asChild
      >
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value || 'Choose...'}
          </span>
          <ChevronsUpDown className="shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map((option, i) => (
          <Fragment key={option.label}>
            {i !== 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel key={option.label}>
              {option.label}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {option.children.map((option) =>
                option.children ? (
                  <SubMenu
                    key={option.label}
                    options={option}
                    onChange={onChange}
                  />
                ) : (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    onChange={onChange}
                  />
                ),
              )}
            </DropdownMenuGroup>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
DropdownSelect.displayName = 'DropdownSelect';

const SubMenu = ({
  options,
  onChange,
}: {
  options: DropdownMenu;
  onChange: (value: string) => void;
}) => (
  <DropdownMenuSub>
    <DropdownMenuSubTrigger>
      <span>{options.label}</span>
    </DropdownMenuSubTrigger>
    <DropdownMenuPortal>
      <DropdownMenuSubContent>
        <DropdownMenuGroup>
          {options.children.map((option) =>
            option.children ? (
              <SubMenu
                key={option.label}
                options={option}
                onChange={onChange}
              />
            ) : (
              <MenuItem
                key={option.label}
                value={option.value}
                label={option.label}
                onChange={onChange}
              />
            ),
          )}
        </DropdownMenuGroup>
      </DropdownMenuSubContent>
    </DropdownMenuPortal>
  </DropdownMenuSub>
);

const MenuItem = ({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (value: string) => void;
}) => (
  <DropdownMenuItem onClick={() => onChange(value)}>{label}</DropdownMenuItem>
);
