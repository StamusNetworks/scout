import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/store/store';

export type MarketingState = {
  newsFeedLastRead: string | undefined;
};

const initialState: MarketingState = {
  newsFeedLastRead: localStorage.getItem('news-feed-last-read') || undefined,
};

export const marketingSlice = createSlice({
  name: 'marketing',
  initialState,
  reducers: {
    setNewsFeedLastRead: (
      state,
      action: PayloadAction<NonNullable<MarketingState['newsFeedLastRead']>>,
    ) => {
      state.newsFeedLastRead = action.payload;
      localStorage.setItem('news-feed-last-read', action.payload);
    },
  },
});

export const { setNewsFeedLastRead } = marketingSlice.actions;

export const marketingInitialState = initialState;

export const selectNewsFeedLastRead = (state: RootState) =>
  state.marketing.newsFeedLastRead;
