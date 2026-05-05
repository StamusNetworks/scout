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

  const Icon = threat.kind === 'compromise' ? Biohazard : Scale;

  return (
    <>
      <ContextMenuItem
        asChild
        disabled={!threat?.id}
      >
        <Link to={getLink(threat.kind, 'threat', threat.id)}>
          <Icon className={iconClass} />
          Go to {threat.kind === 'compromise'
            ? 'threat'
            : 'policy violation'}{' '}
          page
        </Link>
      </ContextMenuItem>
      <ContextMenuItem
        asChild
        disabled={!threat?.id}
      >
        <Link to={getLink(threat.kind, 'family', threat.familyId)}>
          <Icon className={iconClass} />
          Go to family page
        </Link>
      </ContextMenuItem>
    </>
  );
};

const getLink = (
  kind: 'compromise' | 'policyViolation',
  link: 'family' | 'threat',
  id: number,
) => {
  const base = kind === 'compromise' ? '/threats' : '/policy-violations';
  return link === 'family'
    ? `${base}/coverage/family/${id}`
    : `${base}/coverage/threat/${id}`;
};
