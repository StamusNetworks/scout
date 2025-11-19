import { parseAsBoolean, useQueryState } from 'nuqs';

export const useWithAlertsParam = () =>
  useQueryState('with_alerts', parseAsBoolean.withDefault(true));
