import { useEffect } from 'react';

import { API } from '@/store/api';
import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  resetAutoReloadStartDate,
  selectAutoReloadInterval,
} from '../state/ui-state.slice';

export const useAutoReload = () => {
  const dispatch = useAppDispatch();
  const reloadInterval = useAppSelector(selectAutoReloadInterval);

  useEffect(() => {
    if (!reloadInterval) return;

    const interval = setInterval(() => {
      dispatch(API.util.resetApiState());
      dispatch(resetAutoReloadStartDate());
    }, reloadInterval * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [dispatch, reloadInterval]);
};
