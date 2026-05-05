import { ActiveThreat } from '../../api/active-threat.dto';
import { CombinedThreat, Threat } from '../../api/threat.dto';

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
