import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ContextMenuItem } from '@/common/design-system/atoms/ui/context-menu';
import { getMitreTechniqueUrl } from '@/common/lib/mitre';

import { iconClass } from '../context-menu.content';

export const MitreTacticIdOption = ({ tacticId }: { tacticId: string }) => (
  <ContextMenuItem asChild>
    <Link
      to={`https://attack.mitre.org/tactics/${tacticId}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <ExternalLink className={iconClass} />
      See MITRE Tactic
    </Link>
  </ContextMenuItem>
);

export const MitreTechniqueIdOption = ({
  techniqueId,
}: {
  techniqueId: string;
}) => (
  <ContextMenuItem asChild>
    <Link
      to={getMitreTechniqueUrl(techniqueId)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <ExternalLink className={iconClass} />
      See MITRE Technique
    </Link>
  </ContextMenuItem>
);
