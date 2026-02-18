import { Switch } from '@/common/design-system/atoms/ui/switch';
import { cn } from '@/common/lib/utils';

interface SwitchFilterProps {
  value: boolean;
  setValue: (value: boolean) => void;
  title: string;
  disabled?: boolean;
}
export function SwitchFilter({
  value,
  setValue,
  title,
  disabled,
}: SwitchFilterProps) {
  return (
    <label
      className="flex items-center gap-2"
      aria-disabled={disabled}
    >
      <Switch
        checked={value}
        onCheckedChange={(checked) => {
          return checked ? setValue(true) : setValue(false);
        }}
        size="sm"
        disabled={disabled}
      />
      <span
        className={cn(
          'text-sm',
          disabled && 'text-muted-foreground cursor-not-allowed',
        )}
      >
        {title}
      </span>
    </label>
  );
}
