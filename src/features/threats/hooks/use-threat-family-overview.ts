import {
  useGetActiveThreatFamiliesQuery,
  useGetThreatFamiliesQuery,
} from '../api/threats.api';
import { useFamilyDetectionMethods } from './use-family-detection-methods';
import { useFamilyEvents } from './use-family-events';

interface UseThreatFamilyOverviewParams {
  familyId: number;
  tenant?: number;
  startDate?: number;
  endDate?: number;
  pagination: { pageIndex: number; pageSize: number };
  ordering?: string;
}

/**
 * Bundles the four queries the threat-family detail page needs
 * (static family, active family stats, family events count, family
 * detection-methods count). Hooks-layer composition keeps the route
 * thin and testable.
 */
export const useThreatFamilyOverview = ({
  familyId,
  tenant,
  startDate,
  endDate,
  pagination,
  ordering,
}: UseThreatFamilyOverviewParams) => {
  const familyIdStr = familyId.toString();

  const { data: family } = useGetThreatFamiliesQuery(
    { tenant },
    {
      selectFromResult: (result) => ({
        ...result,
        data: result.data?.entities[familyId],
      }),
    },
  );

  const { data: activeFamily, isLoading: activeFamilyLoading } =
    useGetActiveThreatFamiliesQuery(
      { tenant, from: startDate, to: endDate },
      {
        selectFromResult: (result) => ({
          ...result,
          data: result.data?.entities[familyId],
        }),
      },
    );

  const { data: events, isLoading: eventsLoading } = useFamilyEvents({
    familyId: familyIdStr,
    pagination,
    ordering,
  });

  const { data: detectionMethods, isLoading: detectionMethodsLoading } =
    useFamilyDetectionMethods({
      familyId: familyIdStr,
      pagination,
      ordering,
    });

  return {
    family,
    activeFamily,
    activeFamilyLoading,
    eventsCount: events?.count ?? 0,
    eventsLoading,
    detectionMethodsCount: detectionMethods?.count ?? 0,
    detectionMethodsLoading,
  };
};
