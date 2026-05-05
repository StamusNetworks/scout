export type FilterInput = {
  key: string;
  value: string | number;
  options?: {
    role?: string;
    isNegated?: boolean;
    isSuspended?: boolean;
    isWildcarded?: boolean;
  };
};
