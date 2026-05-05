export const formatBeaconMetric = (beaconMetric: number | undefined) => {
  return Math.round((beaconMetric || 0) * 100);
};
