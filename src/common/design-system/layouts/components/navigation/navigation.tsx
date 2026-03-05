import { Badge, BadgeProps } from '@/common/design-system/atoms/ui/badge';
import { cn } from '@/common/lib/utils';

import type { MenuItem, Submenu } from './navigation.config';

export type { MenuItem, Submenu };

/**
 * @deprecated Use AppSidebar instead. This file is kept only for the Tag export.
 */
export const Tag = ({ children, className, ...props }: BadgeProps) => (
  <Badge
    className={cn('px-1 py-0 shadow-none', className)}
    {...props}
  >
    {children}
  </Badge>
);
