import { Row } from '@/common/design-system/atoms/layout/row';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/design-system/atoms/ui/select';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { selectPageSize } from '../../state/dashboard.selectors';
import { setPageSize } from '../../state/dashboard.slice';

export const PageSizeSelector = () => {
  const dispatch = useAppDispatch();
  const pageSize = useAppSelector(selectPageSize);
  return (
    <Row className="items-center gap-2">
      <p className="text-muted-foreground text-sm">Results per block</p>
      <Select
        value={pageSize.toString()}
        onValueChange={(value) => dispatch(setPageSize(parseInt(value)))}
      >
        <SelectTrigger className="w-fit">
          <SelectValue />
          <span className="w-1.5" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5</SelectItem>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="15">15</SelectItem>
          <SelectItem value="20">20</SelectItem>
        </SelectContent>
      </Select>
    </Row>
  );
};
