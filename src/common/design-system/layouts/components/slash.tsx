import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { routes } from '../../../../pages/routes.config';

export const Slash = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(routes.operational_center);
  }, [navigate]);
  return null;
};
