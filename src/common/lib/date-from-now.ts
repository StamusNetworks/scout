import { formatDistance } from 'date-fns';

export const dateFromNow = (date: Date) =>
  formatDistance(date, new Date(), { addSuffix: true }).replace('about ', '');
