import { cn } from '@/common/lib/utils';

import { Column } from './layout/column';
import { Container } from './layout/container';
import { Row } from './layout/row';
import { PageHeader } from './page-header';
import { StatsList } from './page-stats';
import { ScrollArea } from './ui/scroll-area';

export const DefaultPage = ({
  children,
  className,
  title,
  description,
  free_space,
  actions,
  alert,
  stats,
}: {
  children: React.ReactNode;
  className?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  free_space?: React.ReactNode;
  actions?: React.ReactNode;
  alert?: React.ReactNode;
  stats?:
    | React.ReactNode
    | { label: string; value: string | number | React.ReactNode | undefined }[];
}) => (
  <ScrollArea
    className="h-full w-full overflow-clip"
    type="scroll"
  >
    <Container className={cn('@container/app py-5 pb-[75px]', className)}>
      <Row className="justify-between">
        <Column className="grow">
          {alert}
          <PageHeader
            title={title}
            description={description}
            className="mb-3"
          />
          {Array.isArray(stats) ? <StatsList items={stats} /> : stats}
          {free_space}
        </Column>
        {actions}
      </Row>
      {children}
    </Container>
  </ScrollArea>
);
