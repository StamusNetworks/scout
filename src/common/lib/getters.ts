export function lastSeen<T extends { last_seen: string | number | Date }>(
  items: T[] | undefined,
): T | undefined {
  if (!items || items.length === 0) {
    return undefined;
  }
  return items.reduce((mostRecent, current) => {
    const mostRecentDate = new Date(mostRecent.last_seen).getTime();
    const currentDate = new Date(current.last_seen).getTime();

    return currentDate > mostRecentDate ? current : mostRecent;
  }, items[0]);
}
