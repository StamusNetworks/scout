import { ExternalLinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cn } from '@/common/lib/utils';

export const ExternalLink = ({
  to,
  children,
  className,
}: {
  to: string;
  children?: React.ReactNode;
  className?: string;
}) => (
  <Link
    to={to}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      'text-muted-foreground flex items-center gap-1 font-medium underline hover:no-underline',
      className,
    )}
  >
    {children}
    <ExternalLinkIcon className="shrink-0 -translate-y-0.5 text-inherit" />
  </Link>
);
