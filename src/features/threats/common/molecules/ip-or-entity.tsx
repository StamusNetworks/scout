import { compressIPv6, isIP, isIPv6 } from '@/common/lib/ips';
import { EventValue } from '@/features/filtering/filters/query-filters/use-cases/interactive-value/event-value';

import { getEntityKey } from '../utils/get-entity-key';

interface IPEventValueProps {
  entity: string;
  offender: boolean;
  className?: string;
}
export function IpOrEntityEventValue({
  entity,
  offender,
  className,
}: IPEventValueProps) {
  const isIp = isIP(entity);
  const queryKey = isIp ? 'ip' : getEntityKey(offender);
  const formattedEntity =
    isIp && isIPv6(entity) ? compressIPv6(entity) : entity;
  return (
    <EventValue
      query_key={queryKey}
      value={entity}
      className={className}
    >
      {formattedEntity}
    </EventValue>
  );
}
