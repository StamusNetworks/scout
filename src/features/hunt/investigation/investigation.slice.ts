import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/store/store';

export type InvestigationState = {
  stage: 'idle' | 'new' | number | null;
  current: InvestigationStageState | null;
  stages: InvestigationStage[];
  findings_keys: string[];
};

const initialState: InvestigationState = {
  stage: null,
  current: null,
  stages: [],
  findings_keys: [],
};

export type InvestigationValueState = {
  value: string;
  result: 'kept' | 'ignored' | 'undefined';
  evidence: {
    key: string;
    value: string | number;
  }[];
};

export type InvestigationStageState = {
  key: string;
  currentIndex: number;
  values: InvestigationValueState[];
  comment?: string;
};

export type InvestigationStage = Omit<InvestigationStageState, 'currentIndex'>;

export type InvestigationStagePayload = {
  key: string;
  values: string[];
};

export type InvestigationResult = {
  key: string;
  values: string[];
};

export const investigationSlice = createSlice({
  name: 'investigation',
  initialState,
  reducers: {
    startInvestigation: (
      state,
      action: PayloadAction<InvestigationStagePayload>,
    ) => {
      state.stage = 'new';
      state.current = {
        key: action.payload.key,
        currentIndex: 0,
        values: action.payload.values.map((value) => ({
          value,
          result: 'undefined',
          evidence: [],
        })),
      };
    },
    continueInvestigation: (state) => {
      if (!state.current) return;
      if (!state.current.values.some((v) => v.result === 'kept')) return;

      if (state.stage === 'new') {
        state.stages.push({
          key: state.current.key,
          values: state.current.values,
          comment: state.current.comment,
        });
      }

      if (typeof state.stage === 'number') {
        state.stages[state.stage] = {
          key: state.current.key,
          values: state.current.values,
          comment: state.current.comment,
        };
      }

      state.stage = 'idle';
      state.current = null;
    },
    cancelStage: (state) => {
      state.current = null;
      state.stage = 'idle';
    },
    editStage: (state, action: PayloadAction<number>) => {
      if (!state.stages[action.payload]) return;

      state.stage = action.payload;
      state.current = {
        ...state.stages[action.payload],
        currentIndex: -1,
      };
    },
    deleteStage: (state, action: PayloadAction<number>) => {
      state.stages.splice(action.payload, 1);
    },
    terminateInvestigation: (state) => {
      state.stage = null;
      state.current = null;
      state.stages = [];
      state.findings_keys = [];
    },
    voteForCurrentItem: (
      state,
      action: PayloadAction<'keep' | 'ignore' | 'skip'>,
    ) => {
      if (!state.current) return;
      const currentStage = state.current;
      const currentValue = currentStage.values[currentStage.currentIndex];
      switch (action.payload) {
        case 'keep':
          currentValue.result = 'kept';
          break;
        case 'ignore':
          currentValue.result = 'ignored';
          break;
        case 'skip':
        default:
          break;
      }
      currentStage.currentIndex = findNextIndex(
        currentStage.currentIndex,
        currentStage.values,
      );
    },
    addEvidence: (
      state,
      action: PayloadAction<{
        key: string;
        value: string | number;
      }>,
    ) => {
      if (!state.current) return;
      const currentStage = state.current;
      currentStage.values[currentStage.currentIndex].evidence.push(
        action.payload,
      );
    },
    goToItem: (state, action: PayloadAction<number>) => {
      if (!state.current) return;
      const currentStage = state.current;
      if (action.payload < 0 || action.payload > currentStage.values.length - 1)
        return;
      currentStage.currentIndex = action.payload;
    },
    addFindingsKey: (state, action: PayloadAction<string>) => {
      state.findings_keys.push(action.payload);
    },
    removeFindingsKey: (state, action: PayloadAction<string>) => {
      state.findings_keys = state.findings_keys.filter(
        (key) => key !== action.payload,
      );
    },
    setStageComment: (state, action: PayloadAction<string>) => {
      if (!state.current) return;
      state.current.comment = action.payload;
    },
  },
});

export const selectInvestigation = (state: RootState) =>
  state.investigation.ongoing;

export const selectInvestigationStages = (state: RootState) => {
  const investigation = selectInvestigation(state);
  return investigation.stages;
};

export const selectInvestigationStage = (state: RootState) =>
  selectInvestigation(state).stage;

export const selectCurrentInvestigationStage = (state: RootState) =>
  selectInvestigation(state).current;

export const selectCurrentInvestigationValue = (state: RootState) => {
  const stage = selectCurrentInvestigationStage(state);
  return stage?.values[stage?.currentIndex]?.value;
};

const selectCurrentInvestigationKey = (state: RootState) => {
  return selectCurrentInvestigationStage(state)?.key;
};

export const selectStageIsValidToContinue = (state: RootState) => {
  const stage = selectCurrentInvestigationStage(state);
  return stage?.values?.some((v) => v.result === 'kept');
};

export const selectIsWaitingInvestigationToContinue = (state: RootState) =>
  selectInvestigation(state).stage === 'idle';

export const selectInvestigationFindingsKeys = (state: RootState) =>
  selectInvestigation(state).findings_keys;

export const selectIsActiveFindings = (key: string) =>
  createSelector(
    [selectInvestigationFindingsKeys, selectInvestigationStage],
    (findingsKeys, stage) => stage !== null && findingsKeys.includes(key),
  );

export const selectInvestigationFilter = createSelector(
  [
    selectCurrentInvestigationKey,
    selectCurrentInvestigationValue,
    selectInvestigationStage,
    selectInvestigationStages,
  ],
  (key, value, stage, stages) => {
    if (stage === null) return undefined;
    const activeStages =
      typeof stage === 'number' ? stages.slice(0, stage) : stages;
    return {
      stages: activeStages.map((s) => ({
        key: s.key,
        values: s.values.filter((v) => v.result === 'kept').map((v) => v.value),
      })),
      current: {
        key,
        value,
      },
    };
  },
);

export const {
  startInvestigation,
  terminateInvestigation,
  cancelStage,
  addEvidence,
  goToItem,
  voteForCurrentItem,
  continueInvestigation,
  editStage,
  deleteStage,
  addFindingsKey,
  removeFindingsKey,
  setStageComment,
} = investigationSlice.actions;

export const investigationInitialState = initialState;

const findNextIndex = (
  currentIndex: number,
  items: InvestigationValueState[],
) => {
  const nextIndexAfterCurrent = items
    .slice(currentIndex + 1)
    .findIndex((value) => value.result === 'undefined');
  if (nextIndexAfterCurrent !== -1)
    return nextIndexAfterCurrent + currentIndex + 1;
  return items
    .slice(0, currentIndex)
    .findIndex((value) => value.result === 'undefined');
};
