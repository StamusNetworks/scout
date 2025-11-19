import { LucideIcon } from 'lucide-react';
import { isNil } from 'ramda';

import { Card } from '@/common/design-system/atoms/ui/card';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { cn } from '@/common/lib/utils';

import { Column } from '../atoms/layout/column';
import { Row } from '../atoms/layout/row';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../atoms/ui/tooltip';

export interface StatsCardHorizontalProps {
  title: string;
  description: string;
  value: number | undefined;
  previousValue?: number;
  Icon?: LucideIcon;
  className?: string;
  loading: boolean;
  formatFunction?: (value: number) => string;
  dataTest?: string;
  onClick?: () => void;
}

export const StatsCardHorizontal = ({
  onClick,
  ...props
}: StatsCardHorizontalProps) => (
  <Card
    onClick={onClick}
    className={cn('h-full p-4', !!onClick && 'cursor-pointer', props.className)}
  >
    <StatsCardHorizontalContent {...props} />
  </Card>
);

export const StatsCardHorizontalContent = ({
  className,
  title,
  Icon,
  loading,
  formatFunction,
  value,
  previousValue,
  dataTest,
  onClick,
  description,
}: StatsCardHorizontalProps) => {
  const variation = value && previousValue ? value - previousValue : undefined;

  const content = (
    <Column
      className={cn(
        'text-foreground h-full flex-1 grow',
        !!onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      data-testid={dataTest}
    >
      <Row className="mb-1 items-start justify-between gap-2 tracking-tight">
        <p className="text-sm font-normal">{title}</p>
        {Icon && <Icon className="size-4.5! shrink-0" />}
      </Row>
      <Column className="">
        <div
          className="h-7 text-2xl font-bold text-nowrap"
          data-testid="statscard-value"
        >
          {loading ? (
            <Spin />
          ) : isNil(value) ? (
            'N/A'
          ) : formatFunction ? (
            formatFunction(value)
          ) : (
            value
          )}
        </div>
        {!!variation && (
          <p className="text-muted-foreground mt-2 text-xs font-medium">
            {`${variation > 0 ? '+' : ''}${formatFunction ? formatFunction(variation) : variation} since last period`}
          </p>
        )}
      </Column>
    </Column>
  );
  return description ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>{description}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    content
  );
};
