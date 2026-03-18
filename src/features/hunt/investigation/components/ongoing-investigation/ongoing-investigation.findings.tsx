import { Trash } from 'lucide-react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { Label } from '@/common/design-system/atoms/ui/label';
import { Separator } from '@/common/design-system/atoms/ui/separator';
import { getFilterLabel } from '@/features/filtering/query-filters/utils/get-filter-label';
import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  removeFindingsKey,
  selectInvestigationFindingsKeys,
} from '../../investigation.slice';

export const FindingsKeys = () => {
  const dispatch = useAppDispatch();
  const findingsKeys = useAppSelector(selectInvestigationFindingsKeys);

  if (findingsKeys?.length === 0) return null;

  return (
    <>
      <Column>
        <Label className="mb-1">Findings watchlist</Label>
        <Column className="gap-2">
          {findingsKeys.map((key) => (
            <Row
              className="items-center justify-between rounded-md border px-2 py-1"
              key={key}
            >
              <Column>
                <p className="text-xs font-medium">{getFilterLabel(key)}</p>
                <p className="text-foreground/50 text-xs">{key}</p>
              </Column>
              <Button
                onClick={() => dispatch(removeFindingsKey(key))}
                variant="ghost"
                size="icon"
              >
                <Trash size={14} />
              </Button>
            </Row>
          ))}
        </Column>
      </Column>
      <Separator className="my-2" />
    </>
  );
};
