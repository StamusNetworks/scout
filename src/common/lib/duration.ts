import { formatDuration, intervalToDuration } from 'date-fns';

export const getDuration = (start: Date, end: Date) =>
  formatDuration(
    intervalToDuration({
      start,
      end,
    }),
  );
