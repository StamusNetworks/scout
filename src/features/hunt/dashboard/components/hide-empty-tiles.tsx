import { Row } from '@/common/design-system/atoms/layout/row';
import { Label } from '@/common/design-system/atoms/ui/label';
import { Switch } from '@/common/design-system/atoms/ui/switch';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { selectHideEmptyPanels } from '../store/dashboard.selectors';
import { toggleHideEmptyPanels } from '../store/dashboard.slice';

export const HideEmptyPanels = () => {
  const dispatch = useAppDispatch();
  const hideEmptyTiles = useAppSelector(selectHideEmptyPanels);
  return (
    <Row className="items-center">
      <Switch
        checked={hideEmptyTiles}
        onCheckedChange={() => dispatch(toggleHideEmptyPanels())}
      />
      <Label className="ml-2">Hide empty panels</Label>
    </Row>
  );
};
