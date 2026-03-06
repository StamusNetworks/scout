import { esEscape } from '@/common/lib/strings';

export const getSightingQfilter = (
  key: string | undefined,
  value: string | undefined,
  protocol: string | undefined,
) => {
  if (!key || !value || !protocol) return undefined;
  const escaped = esEscape(value);
  const qfilterKey =
    key === 'dns.query.rrname'
      ? `dns.type:"query" AND dns.rrname.raw:"${escaped}"`
      : `${key}.raw:"${escaped}"`;
  return `${qfilterKey} AND event_type:"${esEscape(protocol)}"`;
};
