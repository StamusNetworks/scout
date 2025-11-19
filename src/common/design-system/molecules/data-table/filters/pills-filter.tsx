import { TabsList } from '../../../atoms/ui/borderTabs';
import { Tabs, TabsTrigger } from '../../../atoms/ui/pillTabs';

export interface PillFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FacetedFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
  options: PillFilterOption[];
  defaultValue?: string;
}

export function PillsFilter({
  value,
  onChange,
  options,
  defaultValue,
}: FacetedFilterProps) {
  return (
    <Tabs
      value={value || defaultValue}
      onValueChange={(value) => onChange(value)}
    >
      <TabsList>
        {options.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
          >
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
