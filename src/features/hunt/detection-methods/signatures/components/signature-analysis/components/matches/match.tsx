import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { cn } from '@/common/lib/utils';

import { type Match as TMatch } from '../../../../model/analysis.matches';
import { Badge } from '../badge';
import { BsizeMatchTemplate } from './match.bsize';
import { BytejumpMatchTemplate } from './match.bytejump';
import { BytetestMatchTemplate } from './match.bytetest';
import { ContentMatchTemplate } from './match.content';
import { DatasetMatchTemplate } from './match.dataset';
import { FlowMatchTemplate } from './match.flow';
import { FlowbitsMatchTemplate } from './match.flowbits';
import { IsdataatMatchTemplate } from './match.isdataat';
import { PcreMatchTemplate } from './match.pcre';

interface MatchProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export const Match = ({ children, className }: MatchProps) => (
  <Column className={cn('', className)}>{children}</Column>
);

interface MatchLabelProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}
export const MatchLabel = ({ children, className }: MatchLabelProps) => (
  <Row className={cn('flex flex-wrap items-center gap-1', className)}>
    {children}
  </Row>
);

interface MatchNameProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}
export const MatchName = ({ children, className }: MatchNameProps) => (
  <span
    className={cn('text-muted-foreground mr-1 text-xs font-medium', className)}
  >
    {children}
  </span>
);

interface MatchContent extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export const MatchContent = ({ children, className }: MatchContent) => (
  <div className={cn('break-all', className)}>{children}</div>
);

interface MatchContentLabel extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}
export const MatchContentLabel = ({ children }: MatchContentLabel) => (
  <span className="text-xs font-bold">{children}</span>
);

interface MatchPrefix extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}
export const MatchPrefix = ({ children, className }: MatchPrefix) => (
  <Badge
    className={cn('mr-1 inline-flex rounded-sm', className)}
    variant="secondary"
  >
    {children}
  </Badge>
);

export const MatchTemplate = ({ match }: { match: TMatch }) => {
  switch (match.name) {
    case 'bsize':
      return <BsizeMatchTemplate bsize={match.bsize} />;
    case 'byte_jump':
      return <BytejumpMatchTemplate bytejump={match.byte_jump} />;
    case 'byte_test':
      return <BytetestMatchTemplate bytetest={match.byte_test} />;
    case 'content':
      return <ContentMatchTemplate content={match.content} />;
    case 'dataset':
      return <DatasetMatchTemplate dataset={match.dataset} />;
    case 'flow':
      return <FlowMatchTemplate flow={match.flow} />;
    case 'flowbits':
      return <FlowbitsMatchTemplate flowbits={match.flowbits} />;
    case 'isdataat':
      return <IsdataatMatchTemplate isdataat={match.isdataat} />;
    case 'pcre':
      return <PcreMatchTemplate pcre={match.pcre} />;
    default:
      return (
        <Match>
          <MatchLabel>
            <MatchName>{match.name}</MatchName>
          </MatchLabel>
          <MatchContent>Unsupported yet</MatchContent>
        </Match>
      );
  }
};
