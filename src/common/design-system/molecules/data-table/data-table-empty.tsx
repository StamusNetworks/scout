import { LucideIcon } from 'lucide-react';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '../../atoms/ui/empty';

interface DataTableEmptyProps {
  Icon: LucideIcon;
  entity: string;
  className?: string;
}
export const DataTableEmpty = ({
  Icon,
  entity,
  className,
}: DataTableEmptyProps) => (
  <Empty className={className}>
    <EmptyMedia variant="icon">
      <Icon />
    </EmptyMedia>
    <EmptyContent>
      <EmptyHeader>No {entity} found</EmptyHeader>
      <EmptyDescription>
        Either there are no {entity} or the filters are too restrictive.
      </EmptyDescription>
    </EmptyContent>
  </Empty>
);
