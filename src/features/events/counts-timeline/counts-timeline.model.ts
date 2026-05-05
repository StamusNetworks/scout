/**
 * Time series of IDS event counts (alert / stamus / sightings) over a
 * `[from_date, to_date]` window, bucketed at `interval` ms. The dynamic
 * keys correspond to the event-type series the consumer asked for.
 */
export type CountsTimeline = {
  from_date: number;
  to_date: number;
  interval: number;
} & Record<string, { entries: { time: number; count: number }[] }>;
