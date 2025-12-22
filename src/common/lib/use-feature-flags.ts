import { selectIsEnterprise } from '@/features/user/settings/settings.slice';
import { useAppSelector } from '@/store/store';

export const useFeatureFlags = () => {
  const enterprise = useAppSelector(selectIsEnterprise);
  return {
    experimental: true,
    enterprise,
    operational_center: {
      doc_timeline: false,
      incidents_area_timeline: false,
    },
  };
};
