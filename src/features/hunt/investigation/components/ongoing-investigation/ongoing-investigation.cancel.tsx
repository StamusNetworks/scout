import { ArrowLeft, Trash } from 'lucide-react';

import { Button } from '@/common/design-system/atoms/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  cancelStage,
  selectInvestigationStage,
  terminateInvestigation,
} from '../../investigation.slice';

export const CancelStageOrInvestigation = () => {
  const dispatch = useAppDispatch();
  const currentStage = useAppSelector(selectInvestigationStage);
  return currentStage === 'idle' ? (
    <Button
      variant="ghost"
      className="h-fit grow py-1"
      onClick={() => dispatch(terminateInvestigation())}
    >
      <Trash />
      Abort
    </Button>
  ) : (
    <Button
      variant="ghost"
      className="h-fit grow py-1"
      onClick={() => dispatch(cancelStage())}
    >
      <ArrowLeft />
      Cancel {currentStage === 'new' ? 'stage' : 'edit'}
    </Button>
  );
};
