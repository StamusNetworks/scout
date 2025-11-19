import { Biohazard, Scale } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { ContextMenuItem } from '@/common/design-system/atoms/ui/context-menu';
import { useThreats } from '@/features/hunt/threats/hooks/use-threats';
import { routes } from '@/pages/routes.config';

import { iconClass } from '../context-menu.content';

export const ThreatNameOptions = ({ threatName }: { threatName: string }) => {
  const { data: threats } = useThreats({});
  const threat = useMemo(
    () => threats.find((t) => t.name === threatName),
    [threats, threatName],
  );

  if (!threat) return null;

  const Icon = threat.family_class === 'doc' ? Biohazard : Scale;

  return (
    <>
      <ContextMenuItem
        asChild
        disabled={!threat?.pk}
      >
        <Link
          to={getLink(
            'threats_coverage_threat',
            threat?.family_class,
            'threat',
            threat?.pk,
          )}
        >
          <Icon className={iconClass} />
          Go to {threat.family_class === 'doc'
            ? 'threat'
            : 'policy violation'}{' '}
          page
        </Link>
      </ContextMenuItem>
      <ContextMenuItem
        asChild
        disabled={!threat?.pk}
      >
        <Link
          to={getLink(
            'threats_coverage_family',
            threat?.family_class,
            'family',
            threat?.family,
          )}
        >
          <Icon className={iconClass} />
          Go to family page
        </Link>
      </ContextMenuItem>
    </>
  );
};

const getLink = (
  slug: string,
  familyClass: 'doc' | 'dopv',
  link: 'family' | 'threat',
  id: number,
) =>
  routes[
    (familyClass === 'doc'
      ? slug
      : slug.replace('threats', 'policy_violations')) as keyof typeof routes
  ].replace(link === 'family' ? ':familyId' : ':threatId', id.toString());
