export type FilterInput = {
  key: string;
  value: string | number;
  options?: {
    role?: string;
    is_negated?: boolean;
    is_suspended?: boolean;
    is_wildcarded?: boolean;
  };
};
