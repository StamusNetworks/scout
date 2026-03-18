import { Link } from '@tanstack/react-router';
import { Biohazard, Scale } from 'lucide-react';
import { useMemo } from 'react';

import { ContextMenuItem } from '@/common/design-system/atoms/ui/context-menu';
import { useThreats } from '@/features/threats/common/hooks/use-threats';

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
        <Link to={getLink(threat?.family_class, 'threat', threat?.pk)}>
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
        <Link to={getLink(threat?.family_class, 'family', threat?.family)}>
          <Icon className={iconClass} />
          Go to family page
        </Link>
      </ContextMenuItem>
    </>
  );
};

const getLink = (
  familyClass: 'doc' | 'dopv',
  link: 'family' | 'threat',
  id: number,
) => {
  const base = familyClass === 'doc' ? '/threats' : '/policy-violations';
  return link === 'family'
    ? `${base}/coverage/family/${id}`
    : `${base}/coverage/threat/${id}`;
};
