import { useCallback, useEffect, useRef } from 'react';

import { useSessionActivityMutation } from '../api/auth.api';
import { redirectToLogin } from '../utils/redirect-to-login';

const SESSION_UPDATE_INTERVAL = 1000 * 30;

export const useSessionActivity = () => {
  const idle = useRef<number>(0);
  const hasDisconnected = useRef<boolean>(false);
  const resetIdle = useCallback(() => {
    idle.current = 0;
  }, [idle]);

  const [updateSessionActivity] = useSessionActivityMutation();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (import.meta.env.VITE_APP_MODE !== 'development') {
      interval = setInterval(() => {
        if (hasDisconnected.current) return;
        idle.current += SESSION_UPDATE_INTERVAL;
        updateSessionActivity(idle.current / 1000)
          .unwrap()
          .then((result) => {
            if (result?.disconnect && !hasDisconnected.current) {
              hasDisconnected.current = true;
              if (interval !== undefined) clearInterval(interval);
              redirectToLogin({ variant: 'login' });
            }
          })
          .catch(() => {
            // Mutation errors are surfaced by the global API error handler.
          });
      }, SESSION_UPDATE_INTERVAL);
      document.addEventListener('mousemove', resetIdle);
      document.addEventListener('keypress', resetIdle);
    }
    return () => {
      if (import.meta.env.VITE_APP_MODE !== 'development') {
        clearInterval(interval);
        document.removeEventListener('mousemove', resetIdle);
        document.removeEventListener('keypress', resetIdle);
      }
    };
  }, [resetIdle, updateSessionActivity]);
};
