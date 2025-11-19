import { Row } from '../atoms/layout/row';
import { Checkbox } from '../atoms/ui/checkbox';

export const CheckboxValue = ({
  checked,
  label,
}: {
  checked: boolean;
  label: string;
}) => (
  <Row className="items-center gap-1">
    <Checkbox checked={checked} />
    <p className="text-xs font-medium">{label}</p>
  </Row>
);
