import { Column } from '@/common/design-system/atoms/layout/column';

export function SankeyAttribute({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Column className="bg-muted w-[200px] rounded-md px-2 py-2">
      <div className="text-muted-foreground text-xs font-bold">{title}</div>
      <div className="text-xs">{children}</div>
    </Column>
  );
}
