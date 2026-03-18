import { ActiveThreatFamily } from '../active-threat-family.model';
import { CombinedFamily, ThreatFamily } from '../threat-family.model';

export const combineFamiliesWithStats = (
  familiesList: ThreatFamily[],
  statsList: ActiveThreatFamily[] = [],
): CombinedFamily[] => {
  return familiesList.map((family) => {
    const stats = statsList.find((stat) => stat.pk === family.pk);
    if (stats) {
      return {
        ...family,
        is_active: true,
        family_class: family.klass,
        ...stats,
      };
    }
    return {
      ...family,
      is_active: false,
      family_class: family.klass,
    };
  });
};
