import { Link } from '@tanstack/react-router';
import { Biohazard, Scale } from 'lucide-react';
import { values } from 'ramda';

import { ContextMenuItem } from '@/common/design-system/atoms/ui/context-menu';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';
import { useGetThreatFamiliesQuery } from '@/features/threats/common/threats.api';

import { iconClass } from '../context-menu.content';

export const ThreatFamilyNameOption = ({
  familyName,
}: {
  familyName: string;
}) => {
  const params = useGlobalQueryParams(['tenant']);
  const { data: family } = useGetThreatFamiliesQuery(
    {
      tenant: params.tenant,
    },
    {
      selectFromResult: (result) => ({
        ...result,
        data:
          result.data?.entities &&
          values(result.data.entities).find((t) => t.name === familyName),
      }),
    },
  );

  if (!family) return null;

  const Icon = family.klass === 'doc' ? Biohazard : Scale;

  return (
    <ContextMenuItem
      disabled={!family?.pk}
      asChild
    >
      <Link to={getLink(family.klass, family.pk)}>
        <Icon className={iconClass} />
        Go to family page
      </Link>
    </ContextMenuItem>
  );
};

const getLink = (familyClass: 'doc' | 'dopv', id: number) =>
  familyClass === 'doc'
    ? `/threats/coverage/family/${id}`
    : `/policy-violations/coverage/family/${id}`;
