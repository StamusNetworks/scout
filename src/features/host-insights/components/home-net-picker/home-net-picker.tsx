import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pill-tabs';

type HomeNetPickerProps = {
  value: 'true' | 'false' | 'all';
  onChange: (value: 'true' | 'false' | 'all') => void;
};

export const HomeNetPicker = ({ value, onChange }: HomeNetPickerProps) => {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as 'true' | 'false' | 'all')}
    >
      <TabsList>
        <TabsTrigger value="true">Internal</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="false">External</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
