import { isEmpty } from 'ramda';

import { DatesState, UNITS_IN_MILLISECONDS } from '../model/dates-state';

const getDefaultDates = (): DatesState => ({
  from: new Date().getTime() - 30 * UNITS_IN_MILLISECONDS['days'],
  to: new Date().getTime(),
  type: 'from',
  from_duration: 30,
  from_unit: 'days',
});

type PersistedDates = Partial<DatesState> & {
  start_date?: number | undefined;
  end_date?: number | undefined;
};

const migrateLegacyKeys = (dates: PersistedDates): PersistedDates => {
  if ('start_date' in dates || 'end_date' in dates) {
    return {
      ...dates,
      from: dates.from ?? dates.start_date,
      to: dates.to ?? dates.end_date,
    };
  }
  return dates;
};

export const getPersistedDates = (): DatesState => {
  const raw: PersistedDates = JSON.parse(localStorage.getItem('dates') || '{}');

  if (isEmpty(raw)) {
    const defaultDates = getDefaultDates();
    persistDates(defaultDates);
    return defaultDates;
  }

  const dates = migrateLegacyKeys(raw);

  switch (dates.type) {
    case 'from':
      return {
        from:
          new Date().getTime() -
          (dates.from_duration || 30) *
            UNITS_IN_MILLISECONDS[dates.from_unit || 'days'],
        to: new Date().getTime(),
        type: 'from',
        from_duration: dates.from_duration,
        from_unit: dates.from_unit,
      };
    case 'all':
      return {
        from: undefined,
        to: undefined,
        type: 'all',
        from_duration: undefined,
        from_unit: undefined,
      };
    case 'range':
      return {
        from: dates.from,
        to: dates.to,
        type: 'range',
        from_duration: undefined,
        from_unit: undefined,
      };
    case 'auto':
      return {
        from: dates.from,
        to: dates.to,
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
