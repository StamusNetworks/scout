import { Switch } from '@/common/design-system/atoms/ui/switch';

interface SwitchFilterProps {
  value: boolean;
  setValue: (value: boolean) => void;
  title: string;
}
export function SwitchFilter({ value, setValue, title }: SwitchFilterProps) {
  return (
    <label className="flex items-center gap-2">
      <Switch
        checked={value}
        onCheckedChange={(checked) => {
          return checked ? setValue(true) : setValue(false);
        }}
        size="sm"
      />
      <span className="text-sm">{title}</span>
    </label>
  );
}
