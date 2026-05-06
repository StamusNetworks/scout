import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  addEvidence,
  addFindingsKey,
  type InvestigationStagePayload,
  selectCurrentInvestigationStage,
  selectInvestigationFilter,
  selectInvestigationStage,
  selectIsActiveFindings,
  startInvestigation,
} from '../state/investigation.slice';

export const useInvestigationStage = () =>
  useAppSelector(selectInvestigationStage);

export const useCurrentInvestigationStage = () =>
  useAppSelector(selectCurrentInvestigationStage);

export const useInvestigationFilter = () =>
  useAppSelector(selectInvestigationFilter);

export const useIsActiveFindings = (key: string) =>
  useAppSelector(selectIsActiveFindings(key));

export const useStartInvestigation = () => {
  const dispatch = useAppDispatch();
  return useCallback(
    (payload: InvestigationStagePayload) => dispatch(startInvestigation(payload)),
    [dispatch],
  );
};

export const useAddFindingsKey = () => {
  const dispatch = useAppDispatch();
  return useCallback(
    (key: string) => dispatch(addFindingsKey(key)),
    [dispatch],
  );
};

export const useAddEvidence = () => {
  const dispatch = useAppDispatch();
  return useCallback(
    (payload: { key: string; value: string | number }) =>
      dispatch(addEvidence(payload)),
    [dispatch],
  );
};
