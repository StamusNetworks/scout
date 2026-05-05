import { Checkbox } from '@/common/design-system/atoms/ui/checkbox';
import { Switch } from '@/common/design-system/atoms/ui/switch';
import { cn } from '@/common/lib/utils';

type SideBarFilterProps = {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (next: boolean) => void;
  type?: 'checkbox' | 'switch';
};

export const SideBarFilter = ({
  label,
  checked,
  disabled,
  onChange,
  type = 'checkbox',
}: SideBarFilterProps) => {
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
          onCheckedChange={() => onChange(!checked)}
          disabled={disabled}
        />
      )}
      {type === 'switch' && (
        <Switch
          checked={checked}
          onCheckedChange={() => onChange(!checked)}
          size="sm"
          disabled={disabled}
        />
      )}
      <p className="text-sm">{label}</p>
    </label>
  );
};
