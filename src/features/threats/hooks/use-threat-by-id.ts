import { skipToken } from '@reduxjs/toolkit/query';

import { useGetThreatByIdQuery } from '../api/threats.api';
import { Threat } from '../model/threat';

type Params = {
  threatId: string | undefined;
  tenant?: number;
};

type Result = {
  data: Threat | undefined;
  isLoading: boolean;
  isError: boolean;
};

/**
 * Reads a single threat by ID. Server vocabulary is translated to the
 * domain `Threat` shape inside the API layer (`transformResponse: toThreat`).
 */
export const useThreatById = ({ threatId, tenant }: Params): Result => {
  const { data, isLoading, isError } = useGetThreatByIdQuery(
    threatId === undefined ? skipToken : { threatId, tenant },
  );
  return { data, isLoading, isError };
};
