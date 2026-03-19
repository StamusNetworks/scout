import { cva, VariantProps } from 'class-variance-authority';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button, buttonVariants } from '@/common/design-system/atoms/ui/button';
import { FormItem } from '@/common/design-system/atoms/ui/form';
import { Label } from '@/common/design-system/atoms/ui/label';
import { Textarea } from '@/common/design-system/atoms/ui/textarea';
import { cn } from '@/common/lib/utils';
import {
  getFilterLabel,
  getFilterValue,
} from '@/features/filtering/filters/query-filters/utils/get-filter-label';
import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  continueInvestigation,
  goToItem,
  selectCurrentInvestigationStage,
  selectStageIsValidToContinue,
  setStageComment,
  voteForCurrentItem,
} from '../../investigation.slice';

export const CurrentStage = () => {
  const dispatch = useAppDispatch();
  const stage = useAppSelector(selectCurrentInvestigationStage);
  const canContinue = useAppSelector(selectStageIsValidToContinue);

  if (!stage)
    return <p className="text-sm">Add new investigation stage to continue</p>;

  return (
    <Column>
      <Label className="mb-1">{getFilterLabel(stage.key)}</Label>
      <Column className="gap-1">
        {stage?.values?.map((val, index) => (
          <InvestigationValue
            key={val.value}
            es_key={stage.key}
            status={stage.currentIndex === index ? 'active' : val.result}
            value={val.value}
            onClick={() => dispatch(goToItem(index))}
            evidence={val.evidence}
          />
        ))}
      </Column>
      <Row className="mt-2 gap-1">
        <InvestigationVoteButton
          onClick={() => dispatch(voteForCurrentItem('keep'))}
          variant="outline"
          disabled={stage.currentIndex === -1}
        >
          Keep
        </InvestigationVoteButton>
        <InvestigationVoteButton
          variant="ghost"
          onClick={() => dispatch(voteForCurrentItem('ignore'))}
          disabled={stage.currentIndex === -1}
        >
          Ignore
        </InvestigationVoteButton>
      </Row>
      <FormItem className="mt-2">
        <Label>Stage comment</Label>
        <Textarea
          value={stage.comment}
          onChange={(e) => dispatch(setStageComment(e.target.value))}
        />
      </FormItem>
      <Button
        className="mt-2 h-fit grow py-1"
        disabled={!canContinue}
        onClick={() => dispatch(continueInvestigation())}
        variant="outline"
      >
        Keep and continue
      </Button>
    </Column>
  );
};

interface InvestigationVoteButtonProps
  extends
    React.ComponentPropsWithoutRef<typeof Button>,
    VariantProps<typeof buttonVariants> {}
const InvestigationVoteButton = ({
  children,
  className,
  ...rest
}: InvestigationVoteButtonProps) => (
  <Button
    className={cn('h-fit grow px-2 py-1', className)}
    {...rest}
  >
    {children}
  </Button>
);

const InvestigationValue = ({
  es_key,
  value,
  status,
  onClick,
  className,
  evidence,
}: {
  es_key: string;
  value: string;
  className?: string;
  onClick?: () => void;
  evidence?: { key: string; value: string | number }[];
} & VariantProps<typeof valueVariants>) => (
  <div
    className={cn(
      'flex cursor-pointer flex-col rounded-md border px-2 py-1 text-sm',
      valueVariants({ status, className }),
    )}
    onClick={onClick}
  >
    {getFilterValue(es_key, value)}
    <Column className="max-w-full truncate">
      {evidence?.map((evidence) => (
        <Column
          className="mt-1"
          key={evidence.key + evidence.value}
        >
          <p className="text-xs font-medium opacity-70">
            {getFilterLabel(evidence.key)}
          </p>
          <p
            className="truncate"
            title={getFilterValue(evidence.key, evidence.value).toString()}
          >
            {getFilterValue(evidence.key, evidence.value)}
          </p>
        </Column>
      ))}
    </Column>
  </div>
);

export const valueVariants = cva('', {
  variants: {
    status: {
      undefined: 'bg-card border-border text-card-foreground',
      ignored: 'bg-muted border-muted-foreground/20 text-muted-foreground',
      kept: 'bg-green-500/20 border-green-500 text-green-500',
      active: 'bg-primary text-primary-foreground',
    },
  },
  defaultVariants: {
    status: 'undefined',
  },
});
