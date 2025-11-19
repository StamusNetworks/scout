import { Column } from '../atoms/layout/column';

export const LabelValue = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => (
  <Column>
    <p className="text-foreground/60 text-xs font-medium">{label}</p>
    <p className="text-sm">{value || 'n/a'}</p>
  </Column>
);
