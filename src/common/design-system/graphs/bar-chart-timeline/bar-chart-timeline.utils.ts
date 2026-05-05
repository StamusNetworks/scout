import { CountsTimeline } from '@/features/events/model/counts-timeline';

export const getTimelineData = (res: CountsTimeline) => {
  // Server response is an object with keys: from_date, interval, and then a bunch of other keys which contain
  // the actual data inside entries. We want to transform this into a format that recharts can use.

  // Get the keys which contain the actual data
  const dataKeys = Object.keys(res).filter(
    (key) => !['from_date', 'to_date', 'interval'].includes(key),
  );

  // Define an interface for the tick object
  interface TickData {
    [key: string]: number;
  }

  // Create a Record which will use timestamps as keys and contain the counts of each dataKey
  const ticks: Record<number, TickData> = {};

  // Populate the ticks object with the counts of each dataKey
  dataKeys.forEach((key) => {
    res[key]?.entries?.forEach(({ time, count }) => {
      if (!ticks[time]) {
        ticks[time] = { [key]: count };
      } else {
        ticks[time][key] = count;
      }
    });
  });

  // Transform Record into an array of objects
  const data = Object.entries(ticks)
    .map(([time, counts]) =>
      Object.assign({ time: parseInt(time, 10) }, counts),
    )
    .toSorted((a, b) => a.time - b.time);

  // Chart config (keys and colors)
  const chartConfig = dataKeys.reduce<
    Record<string, { label: string; color: string }>
  >((acc, prev, index) => {
    acc[prev] = {
      label: prev,
      color: ['untagged', 'informational', 'relevant'].includes(prev)
        ? `var(--${prev})`
        : `var(--chart-${(index + 1) % 5})`,
    };
    return acc;
  }, {});

  return {
    chartConfig,
    chartData: data,
    dates: {
      from: res.from_date,
      interval: res.interval,
    },
  };
};
