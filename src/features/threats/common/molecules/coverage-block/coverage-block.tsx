import { Link } from '@tanstack/react-router';
import { VariantProps } from 'class-variance-authority';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Markdown } from '@/common/design-system/atoms/markdown';
import { Badge, badgeVariants } from '@/common/design-system/atoms/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/common/design-system/atoms/ui/card';

import { ThreatKind } from '../../../model/threat';

const getLink = (kind: ThreatKind, link: 'family' | 'threat', id: number) => {
  const base = kind === 'compromise' ? '/threats' : '/policy-violations';
  return `${base}/coverage/${link}/${id}`;
};

export const CoverageBlock = ({
  id,
  description,
  children,
  link,
  kind,
  name,
  isActive,
  badge,
}: {
  id: number;
  isActive: boolean;
  description?: string;
  children?: React.ReactNode;
  link: 'family' | 'threat';
  kind: ThreatKind;
  name: string;
  badge?: string;
}) => {
  return (
    <Link
      to={getLink(kind, link, id)}
      className="h-full"
    >
      <Card
        className="h-full"
        variant={isActive ? (kind === 'compromise' ? 'doc' : 'dopv') : 'base'}
      >
        <CardHeader className="w-full flex-row items-center justify-between gap-2 space-y-0 p-4 pb-2">
          <CardTitle className="overflow-hidden text-ellipsis whitespace-nowrap">
            {name}
          </CardTitle>
          {!!badge && (
            <span className="text-muted-foreground shrink-0 text-xs">
              {badge}
            </span>
          )}
        </CardHeader>
        <CardContent className="space-y-1 p-4 pt-0 text-sm">
          {children}
          {!!description && (
            <p className="text-muted-foreground line-clamp-4 text-xs">
              <Markdown content={description} />
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

interface CoverageBlockRowProps extends VariantProps<typeof badgeVariants> {
  label: string;
  value: string | number;
}

export const CoverageBlockRow = ({
  label,
  value,
  variant = 'default',
}: CoverageBlockRowProps) => (
  <Row className="items-center gap-2">
    <span className="text-xs">{label}</span>{' '}
    <Badge
      className="w-fit rounded-md px-1.5 py-0.25 text-xs"
      variant={variant}
    >
      {value}
    </Badge>
  </Row>
);
