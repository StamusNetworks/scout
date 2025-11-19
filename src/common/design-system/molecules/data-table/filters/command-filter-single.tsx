import { ListFilter, LucideIcon } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/common/design-system/atoms/ui/badge';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/common/design-system/atoms/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/design-system/atoms/ui/popover';
import { Separator } from '@/common/design-system/atoms/ui/separator';
import { cn } from '@/common/lib/utils';

export interface FacetedFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FacetedFilterProps {
  title: string;
  value: string | null;
  onChange: (value: string | null) => void;
  options: FacetedFilterOption[];
  canClear?: boolean;
  canSearch?: boolean;
  Icon?: LucideIcon;
}

export function CommandFilterSingle({
  title,
  value,
  onChange,
  options,
  canClear = true,
  canSearch = true,
  Icon = ListFilter,
}: FacetedFilterProps) {
  const selectedOption = options.find((option) => option.value === value);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-dashed"
        >
          <Icon className="h-4 w-4" />
          {title}
          {value && (
            <>
              <Separator
                orientation="vertical"
                className="mx-2 h-4"
              />
              <Badge
                variant="secondary"
                key={selectedOption?.value}
                className="rounded-sm px-1 font-normal"
              >
                {selectedOption?.label}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0"
        align="start"
      >
        <Command>
          {canSearch && <CommandInput placeholder={title} />}
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value === option.value;
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      onChange(option.value);
                    }}
                  >
                    <div
                      className={cn(
                        'border-primary mr-2 flex h-3.5 w-3.5 items-center justify-center rounded-full border',
                        isSelected
                          ? 'text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
                          isSelected && 'bg-primary',
                        )}
                      />
                    </div>
                    {option.icon && (
                      <option.icon className="text-muted-foreground mr-2 h-4 w-4" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {canClear && value && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange(null)}
                    className="justify-center text-center"
                  >
                    Clear filter
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
