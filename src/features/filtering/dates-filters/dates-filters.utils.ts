import { isEmpty } from 'ramda';

import { DatesState, UNITS_IN_MILLISECONDS } from './dates-filters.types';

const getDefaultDates = (): DatesState => ({
  start_date: new Date().getTime() - 30 * UNITS_IN_MILLISECONDS['days'],
  end_date: new Date().getTime(),
  type: 'from',
  from_duration: 30,
  from_unit: 'days',
});

export const getPersistedDates = (): DatesState => {
  const dates: DatesState = JSON.parse(localStorage.getItem('dates') || '{}');

  if (isEmpty(dates)) {
    const defaultDates = getDefaultDates();
    persistDates(defaultDates);
    return defaultDates;
  }

  switch (dates.type) {
    case 'from':
      return {
        start_date:
          new Date().getTime() -
          (dates.from_duration || 30) *
            UNITS_IN_MILLISECONDS[dates.from_unit || 'days'],
        end_date: new Date().getTime(),
        type: 'from',
        from_duration: dates.from_duration,
        from_unit: dates.from_unit,
      };
    case 'all':
      return {
        start_date: undefined,
        end_date: undefined,
        type: 'all',
        from_duration: undefined,
        from_unit: undefined,
      };
    case 'range':
      return {
        start_date: dates.start_date,
        end_date: dates.end_date,
        type: 'range',
        from_duration: undefined,
        from_unit: undefined,
      };
    case 'auto':
      return {
        start_date: dates.start_date,
        end_date: dates.end_date,
        type: 'auto',
        from_duration: undefined,
        from_unit: undefined,
      };
    default:
      return getDefaultDates();
  }
};

export const persistDates = (dates: DatesState) => {
  localStorage.setItem('dates', JSON.stringify(dates));
};
