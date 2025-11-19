import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AddQfilterCommandState = {
  step: number;
  search: string;
  filter: string | null;
  negated: boolean | null;
  wildcarded: boolean | null;
  value: string | number | null;
};

const initialState: AddQfilterCommandState = {
  step: 0,
  search: '',
  filter: '',
  negated: null,
  wildcarded: null,
  value: '',
};

export const addQfilterCommandSlice = createSlice({
  name: 'addQfilterCommand',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setFilter: (state, action: PayloadAction<string>) => {
      state.search = '';
      state.filter = action.payload;
      state.step = 1;
    },
    setNegated: (state, action: PayloadAction<boolean>) => {
      state.search = '';
      state.negated = action.payload;
      state.step = 2;
    },
    setValue: (state, action: PayloadAction<string | number>) => {
      state.search = '';
      state.value = action.payload;
      state.step = 3;
    },
    setWildcarded: (state, action: PayloadAction<boolean>) => {
      state.search = '';
      state.wildcarded = action.payload;
    },
    resetStep: (state) => {
      if (state.step === 0) return;
      state.step = state.step - 1;
    },
    resetCommand: (state) => {
      state.step = 0;
      state.search = '';
      state.filter = '';
      state.negated = null;
      state.value = '';
      state.wildcarded = null;
    },
  },
});

export const {
  setSearch,
  setFilter,
  setValue,
  setNegated,
  setWildcarded,
  resetStep,
  resetCommand,
} = addQfilterCommandSlice.actions;

export const addQfilterCommandInitialState = initialState;
