type Valid = {
  status: boolean;
  info: string[];
  warnings: string[];
  errors: string[];
};

type Transformations = {
  action: string | null;
  lateral: string;
  target: string;
};

export type SignatureStatusResponse = {
  name: string;
  valid: Valid;
  transformations: Transformations;
} & {
  [key: string]: {
    active: boolean;
  };
};

export type SignatureStatus = {
  pk: number;
  name: string;
  valid: Valid;
  transformations: Transformations;
  active: boolean;
};
