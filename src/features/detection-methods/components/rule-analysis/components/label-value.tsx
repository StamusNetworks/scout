import { useState } from 'react';

import { ExternalLink } from '@/common/design-system/atoms/external-link';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import { capitalizeFirst } from '@/common/lib/strings';
import { cn } from '@/common/lib/utils';

export const LabelValue = ({
  label,
  value,
  tags,
  link,
}: {
  label: string;
  value: string | React.ReactNode;
  tags?: string[];
  link?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Column>
      <Row className="flex-wrap gap-1">
        <p className="text-muted-foreground mr-1 text-xs font-medium">
          {capitalizeFirst(label)}
        </p>
        {tags?.map((tag) => (
          <Badge
            key={tag}
            className="h-4 rounded-full bg-indigo-200 px-2 py-0 text-[0.6rem] text-indigo-900 shadow-none"
          >
            {tag}
          </Badge>
        ))}
      </Row>
      {link ? (
        <ExternalLink to={link}>{value}</ExternalLink>
      ) : (
        <p
          className={cn(
            'text-foreground line-clamp-2 text-sm break-words',
            open && 'line-clamp-none',
          )}
          onClick={() => setOpen(!open)}
        >
          {value}
        </p>
      )}
    </Column>
  );
};
