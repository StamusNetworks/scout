import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  userId: '',
  name: '',
  email: '',
  organizations: [],
  verified: undefined,
};

export type User = typeof initialState;

export const userSlice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.userId = action.payload.userId ?? state.userId;
      state.name = action.payload.name ?? state.name;
      state.email = action.payload.email ?? state.email;
      state.organizations = action.payload.organizations ?? state.organizations;
      state.verified = action.payload.verified ?? state.verified;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      state.userId = action.payload.userId ?? state.userId;
      state.name = action.payload.name ?? state.name;
      state.email = action.payload.email ?? state.email;
      state.organizations = action.payload.organizations ?? state.organizations;
      state.verified = action.payload.verified ?? state.verified;
    },
  },
});

export const { setUser, updateUser } = userSlice.actions;
export const userInitialState = initialState;
