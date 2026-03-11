import { useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';

export const useScrollTop = (ref: React.RefObject<HTMLDivElement>) => {
  const { pathname } = useLocation();
  useEffect(() => {
    ref.current!.scrollTop = 0;
  }, [ref, pathname]);
};
