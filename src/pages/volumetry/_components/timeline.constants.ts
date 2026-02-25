export const NETWORK_EVENTS_QFILTER =
  '(flow_id:* AND NOT event_type:(alert OR stamus OR discovery))';
export const ALERTS_QFILTER = 'event_type:alert';
export const SIGHTINGS_QFILTER = 'event_type:discovery';
export const COMPROMISES_QFILTER =
  'event_type:stamus AND NOT kill_chain:pre_condition';
export const POLICY_VIOLATIONS_QFILTER =
  'event_type:stamus AND kill_chain:pre_condition';

export const NETWORK_EVENTS_COLOR = 'oklch(0.398 0.07 227.392)'; // --chart-3
export const ALERTS_COLOR = 'oklch(0.828 0.189 84.429)'; // --chart-4
export const SIGHTINGS_COLOR = 'oklch(0.6196 0.1067 209.6)'; // --chart-2
export const COMPROMISES_COLOR = 'var(--doc)';
export const POLICY_VIOLATIONS_COLOR = 'var(--dopv)';

export function computeInterval(data: { time: number }[]): number {
  if (data.length < 2) return 0;
  return data[1].time - data[0].time;
}
