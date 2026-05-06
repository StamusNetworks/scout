import { Badge } from '@/common/design-system/atoms/ui/badge';
import { FormItem } from '@/common/design-system/atoms/ui/form';
import { Label } from '@/common/design-system/atoms/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/design-system/atoms/ui/select';
import { DateTime } from '@/common/design-system/entities/date-time';
import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  selectTimeDisplay,
  setTimeDisplay,
  TimeDisplay,
} from '../../state/preferences.slice';
import {
  Category,
  CategoryContent,
  CategoryHeader,
  CategoryTitle,
  FieldDescription,
} from '../preferences-layout';

export const DateTimeSelector = () => {
  return (
    <Category>
      <CategoryHeader>
        <CategoryTitle>Date and time</CategoryTitle>
      </CategoryHeader>
      <div className="text-sm">
        <DateTimeFormat />
      </div>
    </Category>
  );
};

export const DateTimeFormat = () => {
  const dispatch = useAppDispatch();
  const timeDisplay = useAppSelector(selectTimeDisplay);

  return (
    <CategoryContent>
      <FormItem>
        <Label>Preferred date and time format</Label>
        <FieldDescription>
          Pick your prefered date and time display. Other options are visible
          when hovering a date time.
        </FieldDescription>
        <Select
          value={timeDisplay}
          onValueChange={(value) =>
            dispatch(setTimeDisplay(value as TimeDisplay))
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
      <Badge
        className="mt-2 h-fit w-fit"
        variant="discreet"
      >
        <DateTime date={new Date()} />
      </Badge>
    </CategoryContent>
  );
};

const options: { label: string; value: TimeDisplay }[] = [
  {
    label: 'Relative',
    value: 'relative',
  },
  {
    label: 'YYYY-MM-DD HH:MM:SS',
    value: 'human_readable',
  },
  {
    label: 'ISO 8601',
    value: 'iso_8601',
  },
  {
    label: 'UTC',
    value: 'utc',
  },
  {
    label: 'Local',
    value: 'local',
  },
];
