export const getSightingQfilter = (
  key: string | undefined,
  value: string | undefined,
  protocol: string | undefined,
) => {
  if (!key || !value || !protocol) return undefined;
  const qfilterKey =
    key === 'dns.query.rrname'
      ? `dns.type:"query" AND dns.rrname.raw:"${value}"`
      : `${key}.raw:"${value}"`;
  return `${qfilterKey} AND event_type:"${protocol}"`;
};
