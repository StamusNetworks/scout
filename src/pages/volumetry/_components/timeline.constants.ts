export type SeriesKey =
  | 'networkEvents'
  | 'flows'
  | 'alerts'
  | 'compromises'
  | 'policyViolations'
  | 'sightings'
  | 'outlierEvents';

export type SeriesConfig = {
  key: SeriesKey;
  label: string;
  qfilter: string;
  color: string;
  defaultEnabled: boolean;
};

export const TIMELINE_SERIES: SeriesConfig[] = [
  {
    key: 'networkEvents',
    label: 'Network Events',
    qfilter: '(flow_id:* AND NOT event_type:(alert OR stamus OR discovery))',
    color: 'oklch(0.398 0.07 227.392)', // --chart-3
    defaultEnabled: true,
  },
  {
    key: 'flows',
    label: 'Flows',
    qfilter: 'event_type:flow',
    color: 'oklch(0.4457 0.119375 247.7925)', // --chart-1
    defaultEnabled: false,
  },
  {
    key: 'alerts',
    label: 'Alerts',
    qfilter: 'event_type:alert',
    color: 'oklch(0.828 0.189 84.429)', // --chart-4
    defaultEnabled: false,
  },
  {
    key: 'compromises',
    label: 'Compromises',
    qfilter: 'event_type:stamus AND NOT kill_chain:pre_condition',
    color: 'var(--doc)',
    defaultEnabled: true,
  },
  {
    key: 'policyViolations',
    label: 'Policy Violations',
    qfilter: 'event_type:stamus AND kill_chain:pre_condition',
    color: 'var(--dopv)',
    defaultEnabled: false,
  },
  {
    key: 'sightings',
    label: 'Sightings',
    qfilter: 'event_type:discovery',
    color: 'oklch(0.6196 0.1067 209.6)', // --chart-2
    defaultEnabled: false,
  },
  {
    key: 'outlierEvents',
    label: 'Outlier Events',
    qfilter: 'stamus_novel:true',
    color: 'oklch(0.769 0.188 70.08)', // --chart-5
    defaultEnabled: true,
  },
];

export const DEFAULT_ENABLED_SERIES: SeriesKey[] = TIMELINE_SERIES.filter(
  (s) => s.defaultEnabled,
).map((s) => s.key);

export function computeInterval(data: { time: number }[]): number {
  if (data.length < 2) return 0;
  return data[1].time - data[0].time;
}
