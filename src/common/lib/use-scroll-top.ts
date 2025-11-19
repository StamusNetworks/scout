import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollTop = (ref: React.RefObject<HTMLDivElement>) => {
  const { pathname } = useLocation();
  useEffect(() => {
    ref.current!.scrollTop = 0;
  }, [ref, pathname]);
};
