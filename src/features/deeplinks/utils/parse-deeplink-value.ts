import { isNumeric } from '@/common/lib/numbers';

export const parseDeeplinkValue = (value: string): string | number => {
  const unquoted =
    value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value;
  return isNumeric(unquoted) ? Number(unquoted) : unquoted;
};
