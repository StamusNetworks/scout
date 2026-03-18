import { AnyAction, Dispatch } from '@reduxjs/toolkit';

import { Checkbox } from '@/common/design-system/atoms/ui/checkbox';
import { Switch } from '@/common/design-system/atoms/ui/switch';
import { cn } from '@/common/lib/utils';

import { TagFilters, updateTagFilters } from '../store/query-filters.slice';

type SideBarFilterProps = {
  label: string;
  filter_key: keyof TagFilters;
  checked: boolean;
  dispatch: Dispatch<AnyAction>;
  disabled: boolean;
  type?: 'checkbox' | 'switch';
};

export const SideBarFilter = ({
  label,
  filter_key,
  checked,
  dispatch,
  disabled,
  type = 'checkbox',
}: SideBarFilterProps) => (
  <label
    className={cn(
      'flex items-center gap-2',
      disabled && 'text-muted-foreground',
    )}
  >
    {type === 'checkbox' && (
      <Checkbox
        checked={checked}
        onCheckedChange={() =>
          dispatch(updateTagFilters({ [filter_key]: !checked }))
        }
        disabled={disabled}
      />
    )}
    {type === 'switch' && (
      <Switch
        checked={checked}
        onCheckedChange={() =>
          dispatch(updateTagFilters({ [filter_key]: !checked }))
        }
        size="sm"
        disabled={disabled}
      />
    )}
    <p className="text-sm">{label}</p>
  </label>
);
