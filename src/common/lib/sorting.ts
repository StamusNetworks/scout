export const sortBy =
  <T extends Record<string, unknown>>(property: keyof T) =>
  (A: T, B: T) => {
    if (A[property] > B[property]) return 1;
    if (A[property] < B[property]) return -1;
    return 0;
  };
