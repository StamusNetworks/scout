import { useNavigate } from '@tanstack/react-router';
import { Binary, Info, LayoutDashboard, PlusCircle } from 'lucide-react';
import { useState } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Markdown } from '@/common/design-system/atoms/markdown';
import {
  PageActions,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageStat,
  PageStats,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/common/design-system/atoms/ui/dialog';
import { useCreateFilter } from '@/features/query-filters/hooks/use-create-filter';
import { useEnableFilterFlags } from '@/features/query-filters/hooks/use-enable-filter-flags';

import { ActiveThreatFamily } from '../../model/active-threat-family';
import { KIND_LABEL } from '../../model/threat';
import { ThreatFamily } from '../../model/threat-family';
import { ThreatForm } from '../threat-form/threat-form';

interface ThreatFamilyHeaderProps {
  family: ThreatFamily;
  activeFamily?: ActiveThreatFamily;
}

/**
 * Page header for a threat family: name, description, asset stats,
 * and "see events"/"investigate" actions. Pure presentation — no
 * URL state, just data and handlers from the route.
 */
export const ThreatFamilyHeader = ({
  family,
  activeFamily,
}: ThreatFamilyHeaderProps) => {
  const navigate = useNavigate();
  const createFilter = useCreateFilter();
  const enableTags = useEnableFilterFlags();

  const assets = activeFamily?.assets;
  const stats = [
    { label: 'New victims', value: assets?.victims ?? 0 },
    { label: 'Total victims', value: assets?.victims ?? 0 },
    { label: 'New offenders', value: assets?.offenders ?? 0 },
    { label: 'Total offenders', value: assets?.offenders ?? 0 },
  ];

  return (
    <>
      <PageHeader>
        <PageHeaderContent>
          <Row className="items-center">
            <ThreatFamilyName family={family} />
            {(family.id === 1 || family.id === 25) && (
              <Row className="bg-primary text-primary-foreground ml-3 w-fit rounded-md border px-2 py-1 text-xs">
                <Info className="mr-2" />
                Links might be broken in preview mode.
              </Row>
            )}
          </Row>
          <PageDescription>
            <Markdown content={family.description} />
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Button
            variant="outline"
            onClick={() => {
              enableTags();
              createFilter({ key: 'stamus.family_name', value: family.name });
              navigate({ to: '/detection-events' });
            }}
          >
            <Binary />
            See events
          </Button>
          <Button
            onClick={() => {
              enableTags();
              createFilter({ key: 'stamus.family_name', value: family.name });
              navigate({ to: '/explorer' });
            }}
          >
            <LayoutDashboard />
            Investigate
          </Button>
        </PageActions>
      </PageHeader>
      <PageStats>
        {stats.map((s) => (
          <PageStat
            key={s.label}
            label={s.label}
            value={s.value}
          />
        ))}
      </PageStats>
    </>
  );
};

const ThreatFamilyName = ({ family }: { family: ThreatFamily }) => {
  const [isEditing, setIsEditing] = useState(false);
  if (family.id !== 1 && family.id !== 25)
    return <PageTitle>{family.name}</PageTitle>;

  return (
    <Row className="mb-1 items-center gap-2">
      <PageTitle className="mb-0">{family.name}</PageTitle>
      <Row>
        <Dialog
          open={isEditing}
          onOpenChange={setIsEditing}
        >
          <DialogTrigger>
            <Button
              variant="ghost"
              className="text-muted-foreground h-7 w-7 translate-y-px"
            >
              <PlusCircle size={14} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Create Custom {KIND_LABEL[family.kind]}</DialogTitle>
            <ThreatForm
              onClose={() => setIsEditing(false)}
              kind={family.kind}
            />
          </DialogContent>
        </Dialog>
      </Row>
    </Row>
  );
};
