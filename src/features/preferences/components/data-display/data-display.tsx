import { FormItem } from '@/common/design-system/atoms/ui/form';
import { Input } from '@/common/design-system/atoms/ui/input';
import { Label } from '@/common/design-system/atoms/ui/label';
import { JsonView } from '@/features/app-shell';
import {
  selectJsonViewOpen,
  setJsonViewOpen,
} from '@/features/app-shell/state/ui-state.slice';
import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  Category,
  CategoryContent,
  CategoryHeader,
  CategoryTitle,
  FieldDescription,
} from '../preferences-layout';

export const DataDisplay = () => {
  return (
    <Category>
      <CategoryHeader>
        <CategoryTitle>Data display</CategoryTitle>
      </CategoryHeader>
      <JsonViewOpenInput />
    </Category>
  );
};

export const JsonViewOpenInput = () => {
  const dispatch = useAppDispatch();
  const jsonViewOpen = useAppSelector(selectJsonViewOpen);
  return (
    <CategoryContent>
      <FormItem>
        <Label>JSON default open depth</Label>
        <FieldDescription>
          When you open a JSON view, how many levels should be open by default?
        </FieldDescription>
        <Input
          type="number"
          value={jsonViewOpen}
          onChange={(e) => dispatch(setJsonViewOpen(parseInt(e.target.value)))}
          min={1}
          className="max-w-64"
        />
      </FormItem>
      <JsonView
        data={{
          some: {
            deeply: {
              nested: 'property',
              could: {
                be: {
                  very: {
                    nested: true,
                  },
                },
              },
            },
          },
        }}
      />
    </CategoryContent>
  );
};
