import { Link } from '@tanstack/react-router';
import { Biohazard, Scale } from 'lucide-react';
import { values } from 'ramda';

import { ContextMenuItem } from '@/common/design-system/atoms/ui/context-menu';
import { useGetThreatFamiliesQuery } from '@/features/threats/api/threats.api';

import { useGlobalQueryParams } from '../../../../hooks/use-global-query-params';
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

  const Icon = family.kind === 'compromise' ? Biohazard : Scale;

  return (
    <ContextMenuItem
      disabled={!family?.id}
      asChild
    >
      <Link to={getLink(family.kind, family.id)}>
        <Icon className={iconClass} />
        Go to family page
      </Link>
    </ContextMenuItem>
  );
};

const getLink = (kind: 'compromise' | 'policyViolation', id: number) =>
  kind === 'compromise'
    ? `/threats/coverage/family/${id}`
    : `/policy-violations/coverage/family/${id}`;
