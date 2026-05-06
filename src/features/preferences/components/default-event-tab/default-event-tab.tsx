import { FormItem } from '@/common/design-system/atoms/ui/form';
import { Label } from '@/common/design-system/atoms/ui/label';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pill-tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/design-system/atoms/ui/select';
import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  EventDetailDefaultTab,
  selectDefaultEventDetailTab,
  setDefaultEventDetailTab,
} from '../../state/preferences.slice';
import {
  Category,
  CategoryContent,
  CategoryHeader,
  CategoryTitle,
  FieldDescription,
} from '../preferences-layout';

export const DefaultEventTab = () => {
  const dispatch = useAppDispatch();
  const defaultTab = useAppSelector(selectDefaultEventDetailTab);

  return (
    <Category>
      <CategoryHeader>
        <CategoryTitle>Events</CategoryTitle>
      </CategoryHeader>
      <CategoryContent>
        <FormItem>
          <Label>Details default tab</Label>
          <FieldDescription>
            Select which tab opens by default when expanding an event.
          </FieldDescription>
          <Select
            value={defaultTab}
            onValueChange={(value) =>
              dispatch(setDefaultEventDetailTab(value as EventDetailDefaultTab))
            }
          >
            <SelectTrigger className="max-w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map(({ label, value }) => (
                <SelectItem
                  key={value}
                  value={value}
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
        <Tabs value={defaultTab}>
          <TabsList>
            {options.map(({ label, value }) => (
              <TabsTrigger
                key={value}
                value={value}
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CategoryContent>
    </Category>
  );
};

const options: { label: string; value: EventDetailDefaultTab }[] = [
  { label: 'Meta view', value: 'meta_view' },
  { label: 'Synthetic view', value: 'synthetic_view' },
  { label: 'JSON view', value: 'json_view' },
];
