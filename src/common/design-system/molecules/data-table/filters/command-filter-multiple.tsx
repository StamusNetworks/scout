import { CheckIcon } from '@radix-ui/react-icons';
import { ListFilter } from 'lucide-react';
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

interface CommandFilterMultipleProps {
  title?: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: FacetedFilterOption[];
}

export function CommandFilterMultiple({
  title,
  value,
  onChange,
  options,
}: CommandFilterMultipleProps) {
  const [search, setSearch] = React.useState('');
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-dashed"
        >
          <ListFilter className="h-4 w-4" />
          {title}
          {value && value?.length > 0 && (
            <>
              <Separator
                orientation="vertical"
                className="mx-2 h-4"
              />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {value.length}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {value.length > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {value.length} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => value.includes(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder={title}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                forceMount={true}
                className="-mb-1 justify-center"
                onSelect={() => onChange(options.map((o) => o.value))}
              >
                Select All
              </CommandItem>
            </CommandGroup>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value?.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected && value) {
                        onChange(value.filter((v) => v !== option.value));
                      } else {
                        onChange([...(value || []), option.value]);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <CheckIcon className={cn('h-4 w-4')} />
                    </div>
                    {option.icon && (
                      <option.icon className="text-muted-foreground mr-2 h-4 w-4" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {value && value.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange([])}
                    className="justify-center text-center"
                  >
                    Clear filters
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
