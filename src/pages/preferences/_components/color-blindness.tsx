import { Row } from '@/common/design-system/atoms/layout/row';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import { FormItem } from '@/common/design-system/atoms/ui/form';
import { Label } from '@/common/design-system/atoms/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/design-system/atoms/ui/select';
import {
  ColorBlindness,
  selectColorBlindness,
  setColorBlindness,
} from '@/features/ui/preferences/preferences.slice';
import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  Category,
  CategoryContent,
  CategoryHeader,
  CategoryTitle,
} from './layout';

export const ColorBlindnessSelector = () => {
  const dispatch = useAppDispatch();
  const colorBlindness = useAppSelector(selectColorBlindness);

  return (
    <Category>
      <CategoryHeader>
        <CategoryTitle>Accessibility</CategoryTitle>
      </CategoryHeader>
      <CategoryContent>
        <FormItem>
          <Label>Color blindness</Label>
          <Row className="items-center gap-4">
            <Select
              value={colorBlindness}
              onValueChange={(value) =>
                dispatch(setColorBlindness(value as ColorBlindness))
              }
            >
              <SelectTrigger className="max-w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map(({ label, value }) => (
                  <SelectItem
                    key={value}
                    value={value}
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
        </FormItem>
        <Row className="h-fit gap-2">
          <Badge variant="policy_violation">Policy Violation</Badge>
          <Badge variant="victim">Threat (victim)</Badge>
          <Badge variant="offender">Threat (offender)</Badge>
        </Row>
      </CategoryContent>
    </Category>
  );
};

const options: { label: string; value: ColorBlindness }[] = [
  {
    label: 'None',
    value: 'none',
  },
  {
    label: 'Deuteranopia/Protanopia',
    value: 'prot-deut',
  },
  {
    label: 'Tritanopia',
    value: 'trit',
  },
];
