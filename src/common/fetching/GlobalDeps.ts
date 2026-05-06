export type GlobalDeps = {
  from: number;
  to: number;
  eventsTypes: {
    stamus: boolean;
    alert: boolean;
    discovery: boolean;
  };
  tagsFilters: {
    informational: boolean;
    relevant: boolean;
    untagged: boolean;
    novelty: boolean;
  };
  qfilter: string;
  multitenancy: boolean;
  tenant: number;
  body: object;
};
