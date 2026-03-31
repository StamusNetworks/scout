import { createContext, useContext } from 'react';

import { PurposeGroupData } from '@/features/hunting-trail/hooks/use-network-hunting-trail';
import { PurposeSlug } from '@/features/hunting-trail/hunting-trail.model';

type NetworkHuntingTrailContextValue = {
  groups: Record<PurposeSlug, PurposeGroupData>;
};

const NetworkHuntingTrailContext =
  createContext<NetworkHuntingTrailContextValue | null>(null);

export const NetworkHuntingTrailProvider = NetworkHuntingTrailContext.Provider;

export function useNetworkHuntingTrailContext() {
  const ctx = useContext(NetworkHuntingTrailContext);
  if (!ctx) {
    throw new Error(
      'useNetworkHuntingTrailContext must be used within NetworkHuntingTrailProvider',
    );
  }
  return ctx;
}
