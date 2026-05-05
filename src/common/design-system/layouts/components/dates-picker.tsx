import { format, formatDate } from 'date-fns';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { DateTimeInput } from '@/common/design-system/atoms/ui/date-time-input';
import { Label } from '@/common/design-system/atoms/ui/label';
import {
  formatUnit,
  TimeUnit,
  units,
  useAutoRange,
  useDates,
  useSetDates,
} from '@/features/dates';
import {
  selectAutoReloadInterval,
  selectAutoReloadStartDate,
  setAutoReloadInterval,
} from '@/features/ui/ui-state.slice';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { Divider } from '../../atoms/ui/divider';
import { Input } from '../../atoms/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../atoms/ui/popover';
import { Progress } from '../../atoms/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../atoms/ui/select';
import { Separator } from '../../atoms/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../atoms/ui/tooltip';

export const DatesPicker = () => {
  const { type, from_duration, from_unit, start_date, end_date } = useDates();

  const { data, isFetching } = useAutoRange();
  const setDates = useSetDates();
  const handleUseAutoRange = () => {
    if (!data || isFetching) return;
    setDates({
      type: 'auto',
      start_date: data.min_timestamp,
      end_date: data.max_timestamp,
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <Popover>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                data-testid="date-picker-dropdown-trigger"
              >
                <Clock />
                {type === 'from' ? (
                  <p>
                    {from_duration} {formatUnit(from_unit!, from_duration!)}
                  </p>
                ) : type === 'all' ? (
                  <p>All</p>
                ) : type === 'auto' ? (
                  <p>Auto</p>
                ) : (
                  <Column>
                    <p className="text-sm leading-4">
                      {format(new Date(start_date!), 'yyyy-MM-dd HH:mm')}
                    </p>
                    <p className="text-sm leading-4">
                      {format(new Date(end_date!), 'yyyy-MM-dd HH:mm')}
                    </p>
                  </Column>
                )}
              </Button>
            </TooltipTrigger>
          </PopoverTrigger>
          <PopoverContent
            className="w-fit p-4"
            data-testid="date-picker-dropdown-content"
          >
            <Row className="items-stretch gap-1">
              <Column className="gap-1">
                <h2 className="mb-1 text-sm">Hours</h2>
                <FromTimeButton
                  value={1}
                  unit="hours"
                />
                <FromTimeButton
                  value={6}
                  unit="hours"
                />
                <FromTimeButton
                  value={24}
                  unit="hours"
                />
              </Column>
              <Column className="gap-1">
                <h2 className="mb-1 text-sm">Days</h2>
                <FromTimeButton
                  value={2}
                  unit="days"
                />
                <FromTimeButton
                  value={7}
                  unit="days"
                />
                <FromTimeButton
                  value={30}
                  unit="days"
                />
              </Column>
              <Column className="gap-1">
                <h2 className="mb-1 text-sm">Other</h2>
                <FromTimeButton
                  value={1}
                  unit="years"
                />
                <Button
                  variant="outline"
                  onClick={handleUseAutoRange}
                >
                  Auto
                </Button>
              </Column>
              <Separator
                orientation="vertical"
                className="grow"
              />
              <AutoReloadInterval />
            </Row>
            <Divider className="my-3" />
            <CustomRelativeDateInput />
            <Divider className="my-3" />
            <AbsoluteRangePicker />
          </PopoverContent>
        </Popover>
        <TooltipContent className="grid grid-cols-[2rem_1fr] gap-2">
          <p>From</p>
          <p>{formatDate(start_date!, 'yyyy-MM-dd HH:mm:ss')}</p>
          <p>To</p>
          <p>{formatDate(end_date || new Date(), 'yyyy-MM-dd HH:mm:ss')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const FromTimeButton = ({ value, unit }: { value: number; unit: TimeUnit }) => {
  const setDates = useSetDates();
  return (
    <Button
      onClick={() =>
        setDates({ type: 'from', from_duration: value, from_unit: unit })
      }
      variant="outline"
    >
      {value} {formatUnit(unit, value)}
    </Button>
  );
};

const AutoReloadInterval = () => {
  const dispatch = useAppDispatch();
  const autoReloadInterval = useAppSelector(selectAutoReloadInterval);

  return (
    <Column className="gap-1">
      <h2 className="mb-1 text-sm">Auto Reload</h2>
      <Select
        value={autoReloadInterval?.toString()}
        onValueChange={(value) =>
          dispatch(setAutoReloadInterval(parseInt(value)))
        }
      >
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Disabled</SelectItem>
          <SelectItem value="10">10 seconds</SelectItem>
          <SelectItem value="30">30 seconds</SelectItem>
          <SelectItem value="60">1 minute</SelectItem>
          <SelectItem value="120">2 minutes</SelectItem>
          <SelectItem value="300">5 minutes</SelectItem>
        </SelectContent>
      </Select>
      <div className="mt-1">
        <AutoReloadProgress />
      </div>
    </Column>
  );
};

const AutoReloadProgress = () => {
  const start = useAppSelector(selectAutoReloadStartDate);
  const interval = useAppSelector(selectAutoReloadInterval);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (start === 0 || interval === 0) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setProgress(0);
      return;
    }

    const updateProgress = () => {
      const value = Math.floor(
        ((new Date().getTime() - start) / (interval * 1000)) * 100,
      );
      setProgress(value);
    };

    updateProgress();

    const autoupdate = setInterval(updateProgress, 100);

    return () => clearInterval(autoupdate);
  }, [start, interval]);

  return <Progress value={progress} />;
};

const CustomRelativeDateInput = () => {
  const { from_duration, from_unit } = useDates();
  const setDates = useSetDates();
  const [duration, setDuration] = useState<number>(from_duration ?? 1);
  const [unit, setUnit] = useState<TimeUnit>(from_unit ?? 'days');

  return (
    <Column>
      <Label>Custom</Label>
      <Row className="mt-2 gap-1">
        <Input
          type="number"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
        />
        <Select
          value={unit}
          onValueChange={(value) => setUnit(value as TimeUnit)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(units).map((key) => (
              <SelectItem
                key={key}
                value={key}
              >
                {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() =>
            setDates({
              type: 'from',
              from_duration: duration,
              from_unit: unit,
            })
          }
        >
          Submit
        </Button>
      </Row>
    </Column>
  );
};

const AbsoluteRangePicker = () => {
  const { start_date, end_date } = useDates();
  const setDates = useSetDates();
  const [startDate, setStartDate] = useState<Date | undefined>(
    start_date ? new Date(start_date) : new Date(),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    end_date ? new Date(end_date) : new Date(),
  );
  const handleSubmit = () => {
    if (!startDate || !endDate) return;
    setDates({
      type: 'range',
      start_date: startDate.getTime(),
      end_date: endDate.getTime(),
    });
  };
  return (
    <Row className="items-end gap-2">
      <Column
        className="w-full gap-1"
        data-testid="date-picker-start-date"
      >
        <Label>Start date</Label>
        <DateTimeInput
          onChange={setStartDate}
          maxDate={endDate ? endDate?.getTime() - 1000 : undefined}
          defaultValue={startDate}
        />
      </Column>
      <Column
        className="w-full gap-1"
        data-testid="date-picker-end-date"
      >
        <Label>End date</Label>
        <DateTimeInput
          onChange={setEndDate}
          minDate={startDate ? startDate.getTime() + 1000 : undefined}
          defaultValue={endDate}
        />
      </Column>
      <Button
        onClick={handleSubmit}
        disabled={!endDate || !startDate}
      >
        Submit
      </Button>
    </Row>
  );
};
