import { Row } from '@/common/design-system/atoms/layout/row';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { cn } from '@/common/lib/utils';
import { useGetHostInsights } from '@/features/host-insights/hooks/use-get-host-insights';
import { getHostRole, Host } from '@/features/host-insights/model/host';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';

interface RolesProps {
  host: string;
  className?: string;
}
export const Roles = ({ host, className }: RolesProps) => {
  const { data, isFetching, isError } = useGetHostInsights(host);
  if (isFetching) return <Spin />;
  if (isError) return null;
  return (
    <RolesTemplate
      roles={data?.host_id.roles}
      className={className}
    />
  );
};

interface RolesTemplateProps {
  roles: Host['host_id']['roles'];
  className?: string;
}
export const RolesTemplate = ({ roles, className }: RolesTemplateProps) => {
  if (!roles?.length)
    return (
      <EventValue
        query_key="host_id.roles.name"
        value="unclassified"
      >
        <Badge
          variant="outline"
          className="h-fit w-fit"
        >
          unclassified
        </Badge>
      </EventValue>
    );
  return (
    <Row className={cn('gap-1', className)}>
      {roles?.map((role) => (
        <RoleBadge
          key={role.name}
          role={role.name}
        />
      ))}
    </Row>
  );
};

export const RoleBadge = ({ role }: { role: string }) => (
  <EventValue
    query_key="host_id.roles.name"
    value={role}
  >
    <Badge variant="discreet">{getHostRole(role)}</Badge>
  </EventValue>
);
