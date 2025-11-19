import { useCallback, useEffect, useRef } from 'react';

import { useSessionActivityMutation } from '../api/auth.api';

const SESSION_UPDATE_INTERVAL = 1000 * 30; // 30 seconds

export const useSessionActivity = () => {
  const idle = useRef<number>(0);
  const resetIdle = useCallback(() => {
    idle.current = 0;
  }, [idle]);

  const [updateSessionActivity] = useSessionActivityMutation();

  useEffect(() => {
    let interval = undefined;
    if (import.meta.env.VITE_APP_MODE === 'production') {
      interval = setInterval(() => {
        idle.current += SESSION_UPDATE_INTERVAL;
        updateSessionActivity(idle.current / 1000);
      }, SESSION_UPDATE_INTERVAL);
      document.addEventListener('mousemove', resetIdle);
      document.addEventListener('keypress', resetIdle);
    }
    return () => {
      if (import.meta.env.VITE_APP_MODE === 'production') {
        clearInterval(interval);
        document.removeEventListener('mousemove', resetIdle);
        document.removeEventListener('keypress', resetIdle);
      }
    };
  }, [resetIdle, updateSessionActivity]);
};
