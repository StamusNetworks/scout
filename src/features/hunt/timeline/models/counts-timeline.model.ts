export type CountsTimeline = {
  from_date: number;
  to_date: number;
  interval: number;
} & Record<string, { entries: { time: number; count: number }[] }>;
