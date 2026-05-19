import { createContext, useContext } from 'react';

import { PurposeGroupData, PurposeSlug } from '../../model/hunting-trail';
import type { QueryMetadataMap } from '../../model/purpose-grouping';

type NetworkHuntingTrailContextValue = {
  groups: Record<PurposeSlug, PurposeGroupData>;
  queryMetadata?: QueryMetadataMap;
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
