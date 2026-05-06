import { useCallback } from 'react';

import { useAppDispatch } from '@/store/store';

import { disableHelp, type HelpState } from '../state/help.slice';

export const useDisableHelp = () => {
  const dispatch = useAppDispatch();
  return useCallback(
    (key: keyof HelpState) => dispatch(disableHelp(key)),
    [dispatch],
  );
};
