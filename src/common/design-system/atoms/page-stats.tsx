import React from 'react';

import { Column } from './layout/column';
import { Row } from './layout/row';

export const StatsBlock = ({
  label,
  value,
}: {
  label: string;
  value: string | number | React.ReactNode | undefined;
}) => (
  <Column>
    <h3 className="text-foreground/50 mb-1 text-xs font-bold">{label}</h3>
    <p className="peer text-sm break-all">{value}</p>
    <p className="hidden text-sm peer-empty:block">-</p>
  </Column>
);

export const StatsList = ({
  items,
}: {
  items: {
    label: string;
    value: string | number | React.ReactNode | undefined;
  }[];
}) => (
  <Row className="gap-4">
    {items.map((item, i) => (
      <React.Fragment key={item.label}>
        <StatsBlock
          key={item.label}
          label={item.label}
          value={item.value}
        />
        {i !== items.length - 1 && (
          <div className="bg-foreground/10 h-full w-px" />
        )}
      </React.Fragment>
    ))}
  </Row>
);
