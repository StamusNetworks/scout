export const NETWORK_EVENTS_COLOR = 'oklch(0.6196 0.1067 209.6)'; // --chart-2
export const ALERTS_COLOR = 'oklch(0.828 0.189 84.429)'; // --chart-4

export const NETWORK_EVENTS_QFILTER =
  '(flow_id:* AND NOT event_type:(alert OR stamus OR discovery))';
export const ALERTS_QFILTER = 'event_type:(alert OR stamus OR discovery)';

export function computeInterval(data: { time: number }[]): number {
  if (data.length < 2) return 0;
  return data[1].time - data[0].time;
}
