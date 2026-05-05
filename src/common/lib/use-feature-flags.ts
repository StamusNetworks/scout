import { useIsEnterprise } from '@/features/settings';

export const useFeatureFlags = () => {
  const enterprise = useIsEnterprise();
  return {
    experimental: true,
    enterprise,
    operational_center: {
      doc_timeline: false,
      incidents_area_timeline: false,
    },
  };
};
