import { VariantProps } from 'class-variance-authority';
import { Link } from 'react-router-dom';

import { Markdown } from '@/common/design-system/atoms/markdown';
import { Badge, badgeVariants } from '@/common/design-system/atoms/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/common/design-system/atoms/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import { routes } from '@/pages/routes.config';

const getLink = (
  familyClass: 'doc' | 'dopv',
  link: 'family' | 'threat',
  id: number,
) => {
  return routes[
    `${familyClass === 'doc' ? 'threats' : 'policy_violations'}_coverage_${link}`
  ].replace(link === 'family' ? ':familyId' : ':threatId', id.toString());
};
export const CoverageBlock = ({
  id,
  tooltip,
  children,
  link,
  familyClass,
  name,
  isActive,
}: {
  id: number;
  isActive: boolean;
  tooltip?: string;
  children: React.ReactNode;
  link: 'family' | 'threat';
  familyClass: 'doc' | 'dopv';
  name: string;
}) => {
  return (
    <Link
      to={getLink(familyClass, link, id)}
      className="h-full"
    >
      <Card
        className="h-full"
        variant={isActive ? (familyClass === 'doc' ? 'doc' : 'dopv') : 'base'}
      >
        <CardHeader className="w-full flex-row items-center justify-between gap-2 space-y-0 p-4">
          <CardTitle className="overflow-hidden text-ellipsis whitespace-nowrap">
            {name}
          </CardTitle>
          {!!tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="bg-muted flex h-5 w-5 items-center justify-center rounded-full text-xs font-black select-none">
                    ?
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-96">
                  <Markdown content={tooltip} />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardHeader>
        <CardContent className="space-y-1 p-4 pt-0 text-sm">
          {children}
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
  variant,
}: CoverageBlockRowProps) => (
  <div className="flex items-center justify-between">
    <span className="text-xs">{label}</span>{' '}
    <Badge
      className="w-fit rounded-full px-1.5 py-0.25 text-xs"
      variant={variant}
    >
      {value}
    </Badge>
  </div>
);
