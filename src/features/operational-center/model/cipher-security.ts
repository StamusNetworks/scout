type TimelinePoint = { time: number; count: number };

export type CipherSecurityPoint = TimelinePoint & {
  recommended: number | undefined;
  insecure: number | undefined;
  degraded: number | undefined;
};

export const joinCipherSecurityTimelines = (
  recommended: TimelinePoint[] | undefined,
  insecure: TimelinePoint[] | undefined,
  degraded: TimelinePoint[] | undefined,
): CipherSecurityPoint[] | undefined => {
  if (!recommended || !insecure || !degraded) return undefined;
  return recommended.map((point, i) => ({
    ...point,
    recommended: recommended[i]?.count,
    insecure: insecure[i]?.count,
    degraded: degraded[i]?.count,
  }));
};
