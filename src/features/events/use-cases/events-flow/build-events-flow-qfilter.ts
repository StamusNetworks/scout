import { type EventTypeFlags } from '@/features/query-filters';

export function buildEventsFlowQfilter(
  qfilter?: string,
  eventTypes?: EventTypeFlags | null,
): string | undefined {
  const parts: string[] = [];
  if (qfilter) parts.push(qfilter);

  if (eventTypes) {
    const activeTypes = [
      eventTypes.alert && 'event_type:alert',
      eventTypes.stamus && 'event_type:stamus',
      eventTypes.discovery && 'event_type:discovery',
    ].filter(Boolean);
    // Only restrict when a subset is active (all true = no restriction needed)
    if (activeTypes.length > 0) {
      parts.push(`(${activeTypes.join(' OR ')})`);
    }
  }

  return parts.length ? parts.join(' AND ') : undefined;
}
