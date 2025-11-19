import { ActiveThreat } from '../model/active-threat.model';
import { CombinedThreat, Threat } from '../model/threat.model';

export const combineThreatsWithStats = (
  threatsList: Threat[],
  statsList: ActiveThreat[] = [],
): CombinedThreat[] => {
  return threatsList.map((threat) => {
    const stats = statsList.find((stat) => stat.pk === threat.pk);
    if (stats) {
      return {
        ...threat,
        is_active: true,
        ...stats,
      };
    }
    return {
      ...threat,
      is_active: false,
    };
  });
};
