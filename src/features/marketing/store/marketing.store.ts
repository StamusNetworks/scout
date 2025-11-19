import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/store/store';

const initialState: MarketingState = {
  newsFeedLastRead: localStorage.getItem('news-feed-last-read') || undefined,
};

export type MarketingState = {
  newsFeedLastRead: string | undefined;
};

export const marketingStateSlice = createSlice({
  name: 'dashboardPageState',
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

export const { setNewsFeedLastRead } = marketingStateSlice.actions;

export const marketingStateInitialState = initialState;

export const selectNewstFeedLastRead = (state: RootState) =>
  state.marketing.newsFeedLastRead;
