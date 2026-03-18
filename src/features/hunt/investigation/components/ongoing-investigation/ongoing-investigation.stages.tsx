import { cva } from 'class-variance-authority';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Label } from '@/common/design-system/atoms/ui/label';
import { Separator } from '@/common/design-system/atoms/ui/separator';
import { cn } from '@/common/lib/utils';
import {
  getFilterLabel,
  getFilterValue,
} from '@/features/filtering/query-filters/utils/get-filter-label';
import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  editStage,
  InvestigationStage as InvestigationStageType,
  selectInvestigationStage,
  selectInvestigationStages,
} from '../../investigation.slice';

export const InvestigationStages = () => {
  const currStage = useAppSelector(selectInvestigationStage);
  const stages = useAppSelector(selectInvestigationStages);

  if (!stages.length) return null;

  return (
    <Column>
      <Label className="mb-1">Stages</Label>
      <Column className="gap-1">
        {stages.map((stage, index) => (
          <InvestigationStage
            stage={stage}
            key={index}
            index={index}
            variant={
              typeof currStage === 'number'
                ? currStage === index
                  ? 'active'
                  : currStage < index
                    ? 'muted'
                    : 'default'
                : 'default'
            }
          />
        ))}
      </Column>
      <Separator className="my-2" />
    </Column>
  );
};

const stageVariants = cva(
  'rounded-md border px-2 py-1 text-sm user-select-none cursor-pointer',
  {
    variants: {
      variant: {
        muted: 'bg-muted border-muted-foreground/30 text-muted-foreground',
        default: 'bg-card border-border text-card-foreground',
        active: 'bg-primary border-primary text-primary-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const InvestigationStage = ({
  stage,
  index,
  variant,
}: {
  stage: InvestigationStageType;
  index: number;
  variant: 'muted' | 'default' | 'active';
}) => {
  const dispatch = useAppDispatch();
  const handleClick = () => {
    dispatch(editStage(index));
  };
  return (
    <Column
      className={cn(stageVariants({ variant }))}
      onClick={handleClick}
    >
      <p className="truncate text-xs font-medium opacity-60">
        {getFilterLabel(stage.key)}
      </p>
      <Column>
        {stage.values
          .filter((v) => v.result === 'kept')
          .map((v) => (
            <p
              key={v.value}
              className="truncate"
              title={getFilterValue(stage.key, v.value as never).toString()}
            >
              {getFilterValue(stage.key, v.value as never)}
            </p>
          ))}
      </Column>
    </Column>
  );
};
