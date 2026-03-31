import { createContext, useContext } from 'react';

import { PurposeSlug } from '@/features/hunting-trail/hunting-trail.model';
import { PurposeGroupData } from '@/features/hunting-trail/use-cases/network-hunting-trail/use-network-hunting-trail';

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
