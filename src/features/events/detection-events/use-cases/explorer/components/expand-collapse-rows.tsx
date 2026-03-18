import { Button } from '@/common/design-system/atoms/ui/button';
import { ButtonGroup } from '@/common/design-system/atoms/ui/button-group';
import { useAppDispatch } from '@/store/store';

import { collapseAllPanels, expandAllPanels } from '../store/dashboard.slice';

export const ExpandCollapseRows = () => {
  const dispatch = useAppDispatch();
  return (
    <ButtonGroup>
      <Button
        variant="outline"
        onClick={() => dispatch(collapseAllPanels())}
      >
        Collapse
      </Button>
      <Button
        variant="outline"
        onClick={() => dispatch(expandAllPanels())}
      >
        Expand
      </Button>
    </ButtonGroup>
  );
};
