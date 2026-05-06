import { createContext, useContext } from 'react';

import { PurposeGroupData, PurposeSlug } from '../../model/hunting-trail';

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
