import { Checkbox } from '@/common/design-system/atoms/ui/checkbox';
import { Switch } from '@/common/design-system/atoms/ui/switch';
import { cn } from '@/common/lib/utils';
import { useTagFiltersRepository } from '@/features/filtering/filters/tag-filters/tag-filters.repository';

import { TagFilters } from '../../query-filters.store';

type SideBarFilterProps = {
  label: string;
  filter_key: keyof TagFilters;
  checked: boolean;
  disabled: boolean;
  type?: 'checkbox' | 'switch';
};

export const SideBarFilter = ({
  label,
  filter_key,
  checked,
  disabled,
  type = 'checkbox',
}: SideBarFilterProps) => {
  const tagFiltersRepo = useTagFiltersRepository();
  return (
    <label
      className={cn(
        'flex items-center gap-2',
        disabled && 'text-muted-foreground',
      )}
    >
      {type === 'checkbox' && (
        <Checkbox
          checked={checked}
          onCheckedChange={() => tagFiltersRepo.set({ [filter_key]: !checked })}
          disabled={disabled}
        />
      )}
      {type === 'switch' && (
        <Switch
          checked={checked}
          onCheckedChange={() => tagFiltersRepo.set({ [filter_key]: !checked })}
          size="sm"
          disabled={disabled}
        />
      )}
      <p className="text-sm">{label}</p>
    </label>
  );
};
