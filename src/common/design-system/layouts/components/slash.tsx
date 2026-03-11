import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useFeatureFlags } from '@/common/lib/use-feature-flags';

export const Slash = () => {
  const { enterprise } = useFeatureFlags();
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: enterprise ? '/operational-center' : '/explorer' });
  }, [navigate, enterprise]);
  return null;
};
