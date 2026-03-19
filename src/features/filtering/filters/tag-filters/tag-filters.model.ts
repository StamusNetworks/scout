export type EventTypes = {
  discovery: boolean;
  stamus: boolean;
  alert: boolean;
};

export type AlertTags = {
  relevant: boolean;
  untagged: boolean;
  informational: boolean;
};

export type Novelty = {
  novelty: boolean;
};

export type TagFilters = EventTypes & AlertTags & Novelty;
