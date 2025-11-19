import { Biohazard, Scale } from 'lucide-react';
import { values } from 'ramda';
import { Link } from 'react-router-dom';

import { ContextMenuItem } from '@/common/design-system/atoms/ui/context-menu';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetThreatFamiliesQuery } from '@/features/hunt/threats/api/threats.api';
import { routes } from '@/pages/routes.config';

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
      <Link to={getLink('threats_coverage_family', family.klass, family.pk)}>
        <Icon className={iconClass} />
        Go to family page
      </Link>
    </ContextMenuItem>
  );
};

const getLink = (slug: string, familyClass: 'doc' | 'dopv', id: number) =>
  routes[
    (familyClass === 'doc'
      ? slug
      : slug.replace('threats', 'policy_violations')) as keyof typeof routes
  ].replace(':familyId', id.toString());
