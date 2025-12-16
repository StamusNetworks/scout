import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useFeatureFlags } from '@/common/lib/use-feature-flags';

import { routes } from '../../../../pages/routes.config';

export const Slash = () => {
  const { enterprise } = useFeatureFlags();
  const navigate = useNavigate();
  useEffect(() => {
    navigate(enterprise ? routes.operational_center : routes.explorer);
  }, [navigate, enterprise]);
  return null;
};
