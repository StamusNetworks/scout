export type RuleSet = {
  id: number;
  name: string;
  description: string;
  /** ISO 8601 date string. */
  createdAt: string;
  /** ISO 8601 date string. */
  updatedAt: string;
  needTest: boolean;
  isValid: boolean;
  errors: string[];
  rulesCount: number;
  sources: number[];
  categories: number[];
  warnings: string;
  warningsSendMail: string;
};
