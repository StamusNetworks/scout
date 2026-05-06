import { Asterisk } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { Checkbox } from '@/common/design-system/atoms/ui/checkbox';
import { Input } from '@/common/design-system/atoms/ui/input';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pill-tabs';
import { cn } from '@/common/lib/utils';

import {
  isNegatable,
  isWildcardable,
} from '../../definitions/query-filter.definitions';
import { useQueryFilterDefinition } from '../../hooks/use-filters-definitions';

type FilterState = {
  key: string;
  value: string | number;
  isNegated: boolean;
  isWildcarded: boolean;
  enabled: boolean;
};

interface FilterInputProps {
  initialValue: FilterState;
  onValueChange: (value: FilterState & { enabled: boolean }) => void;
  disabled?: boolean;
  edit: boolean;
}

export const FilterInput = ({
  initialValue,
  onValueChange,
  disabled = false,
  edit = false,
}: FilterInputProps) => {
  const filterDef = useQueryFilterDefinition(initialValue.key);

  const [enabled, setEnabled] = useState<boolean>(initialValue.enabled);
  const [value, setValue] = useState<string | number>(initialValue.value);
  const [isNegated, setNegated] = useState<boolean>(
    initialValue.isNegated || false,
  );
  const [isWildcarded, setWildcarded] = useState<boolean>(
    initialValue.isWildcarded || false,
  );

  // Use a ref to store the latest onValueChange callback to avoid infinite loops
  const onValueChangeRef = useRef(onValueChange);
  useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  const isValid = !isWildcarded || !value.toString().includes(' ');

  useEffect(() => {
    onValueChangeRef.current({
      key: initialValue.key,
      enabled,
      value,
      isNegated,
      isWildcarded,
    });
  }, [enabled, value, isNegated, isWildcarded, initialValue.key]);

  return (
    <Row className="flex grow items-center gap-3">
      <Checkbox
        checked={enabled}
        onCheckedChange={(checked) => setEnabled(!!checked)}
        disabled={disabled}
      />
      <Column className="w-28">
        <span
          className="truncate text-sm text-nowrap"
          title={filterDef?.label}
        >
          {filterDef?.label}
        </span>
        <span
          className="text-muted-foreground truncate text-xs text-nowrap"
          title={initialValue.key}
        >
          {initialValue.key}
        </span>
      </Column>
      {isNegatable(initialValue.key) !== false && (
        <Tabs
          defaultValue={initialValue.isNegated ? 'not' : 'is'}
          onValueChange={(value) => setNegated(value === 'not')}
        >
          <TabsList className="h-fit">
            <TabsTrigger
              className="px-2 py-0.5"
              value="is"
              disabled={disabled || !edit}
            >
              is
            </TabsTrigger>
            <TabsTrigger
              className="px-2 py-0.5"
              value="not"
              disabled={disabled || !edit}
            >
              not
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      {isWildcardable(filterDef?.type ?? '') !== false && (
        <Button
          type="button"
          className="size-5 px-0"
          variant={isWildcarded ? 'default' : 'outline'}
          size="none"
          onClick={() => setWildcarded(!isWildcarded)}
          disabled={disabled || !edit}
        >
          <Asterisk className="h-4 w-4" />
        </Button>
      )}
      <Column className="grow">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={cn('grow', !isValid && 'text-destructive')}
          disabled={disabled || !edit}
        />
        {!isValid && (
          <span className="text-destructive text-xs">No spaces allowed</span>
        )}
      </Column>
    </Row>
  );
};
