import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import {
  ArrowUpDown,
  Binary,
  Copy,
  Filter,
  FilterX,
  LaptopMinimal,
  LayoutDashboard,
  Search,
} from 'lucide-react';
import { useMemo } from 'react';

import {
  ContextMenuContent as ContextMenuContentBase,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/common/design-system/atoms/ui/context-menu';
import { isIP } from '@/common/lib/ips';
import { saveToClipboard } from '@/common/lib/save';
import { startsWithOneOf } from '@/common/lib/strings';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { useGetDeeplinksQuery } from '@/features/deeplinks';
import {
  useAddEvidence,
  useCurrentInvestigationStage,
  useInvestigationStage,
} from '@/features/investigation';

import { useCreateFilter } from '../../../hooks/use-create-filter';
import { useEnableFilterFlags } from '../../../hooks/use-enable-filter-flags';
import { useQueryFilterDefinition } from '../../../hooks/use-filters-definitions';
import { useSoftReplaceFilters } from '../../../hooks/use-soft-replace-filters';
import { resolveEntityTypes } from '../../../utils/entity-validators';
import { MitreTacticIdOption, MitreTechniqueIdOption } from './options/mitre';
import { ThreatFamilyNameOption } from './options/threat-family-name';
import { ThreatNameOptions } from './options/threat-name';

export const iconClass = 'w-4 h-4 text-muted-foreground mr-2';

export const ContextMenuContent = ({
  query_key,
  value,
  displayValue,
  contextMenuOptions,
}: {
  query_key: string;
  value: string | number;
  displayValue: string;
  contextMenuOptions?: React.ReactNode;
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const addEvidence = useAddEvidence();
  const createFilter = useCreateFilter();
  const replaceFilters = useSoftReplaceFilters();
  const enableTags = useEnableFilterFlags();
  const { data: deeplinksData } = useGetDeeplinksQuery({
    page: 1,
    pageSize: 1000000,
  });
  const filterDef = useQueryFilterDefinition(query_key);
  const resolvedEntity = useMemo(
    () => resolveEntityTypes(filterDef?.entity, value),
    [filterDef?.entity, value],
  );
  const deeplinks = useMemo(() => {
    if (!deeplinksData) return [];
    return deeplinksData.results.filter((deeplink) =>
      !deeplink.enabled
        ? false
        : deeplink.all ||
          (resolvedEntity &&
            deeplink.entities.some((entity) =>
              Array.isArray(resolvedEntity)
                ? resolvedEntity.includes(entity)
                : resolvedEntity === entity,
            )),
    );
  }, [deeplinksData, resolvedEntity]);
  const investigationStage = useInvestigationStage();
  const currentStage = useCurrentInvestigationStage();
  const { enterprise } = useFeatureFlags();
  return (
    <ContextMenuContentBase
      className="w-64"
      onClick={(e) => e.stopPropagation()} // When inside something with an onClick like a table row, prevents triggering it when clicking a menu option
      onCloseAutoFocus={(e) => e.preventDefault()} // When inside a tooltip, prevents reopening the tooltip when exiting the menu
      onFocus={(e) => e.preventDefault()} // When inside a toolip, prevents reopening the tooltip when hovering menu options
      onPointerLeave={(e) => e.preventDefault()} // Prevent closing tooltip when nested bc losing focus
      onMouseLeave={(e) => e.preventDefault()} // Prevent closing tooltip when nested bc losing focus
    >
      <ContextMenuLabel className="text-muted-foreground text-xs font-normal">
        {query_key}
      </ContextMenuLabel>
      <ContextMenuSeparator />
      {investigationStage !== null && (
        <>
          <ContextMenuItem
            disabled={
              investigationStage === 'idle' || currentStage?.currentIndex === -1
            }
            onClick={() =>
              addEvidence({
                key: query_key,
                value,
              })
            }
            className="font-medium"
          >
            <Search className={iconClass} />
            Add to investigation
          </ContextMenuItem>
          <ContextMenuSeparator />
        </>
      )}
      <ContextMenuItem
        onClick={() => createFilter({ key: query_key, value: value })}
      >
        <Filter className={iconClass} /> Add global filter
      </ContextMenuItem>
      <ContextMenuItem
        onClick={() =>
          createFilter({
            key: query_key,
            value,
            options: { isNegated: true },
          })
        }
      >
        <FilterX className={iconClass} />
        Add negated filter
      </ContextMenuItem>
      <ContextMenuItem onClick={() => saveToClipboard(displayValue.toString())}>
        <Copy className={iconClass} />
        Copy to clipboard
      </ContextMenuItem>
      <ContextMenuSeparator />
      {!pathname.startsWith('/explorer') && (
        <ContextMenuItem
          onClick={() => {
            enableTags();
            replaceFilters([{ key: query_key, value }]);
            navigate({ to: '/explorer' });
          }}
        >
          <LayoutDashboard className={iconClass} />
          Explore
        </ContextMenuItem>
      )}
      {!pathname.startsWith('/detection-events') && (
        <ContextMenuItem
          onClick={() => {
            enableTags();
            replaceFilters([{ key: query_key, value }]);
            navigate({ to: '/detection-events' });
          }}
        >
          <Binary className={iconClass} />
          See detection events
        </ContextMenuItem>
      )}
      {!pathname.startsWith('/network-events') && (
        <ContextMenuItem
          onClick={() => {
            replaceFilters([{ key: query_key, value }]);
            navigate({ to: '/network-events' });
          }}
          disabled={startsWithOneOf(query_key, [
            'alert.',
            'host_id.',
            'stamus.',
          ])}
        >
          <ArrowUpDown className={iconClass} />
          See network events
        </ContextMenuItem>
      )}

      {enterprise &&
        (filterDef?.type === 'ip' ||
          (resolvedEntity &&
            (Array.isArray(resolvedEntity)
              ? resolvedEntity.includes('IP')
              : resolvedEntity === 'IP'))) &&
        isIP(value?.toString() || '') && (
          <ContextMenuItem asChild>
            <Link
              to="/hosts/$hostId"
              params={{ hostId: String(value) }}
            >
              <LaptopMinimal className={iconClass} />
              View Host details
            </Link>
          </ContextMenuItem>
        )}
      {query_key === 'stamus.threat_name' && (
        <ThreatNameOptions threatName={value as string} />
      )}
      {query_key === 'stamus.family_name' && (
        <ThreatFamilyNameOption familyName={value as string} />
      )}
      {query_key === 'alert.metadata.mitre_tactic_id' && (
        <MitreTacticIdOption tacticId={value as string} />
      )}
      {query_key === 'alert.metadata.mitre_technique_id' && (
        <MitreTechniqueIdOption techniqueId={value as string} />
      )}
      {contextMenuOptions}
      <ContextMenuSub>
        <ContextMenuSubTrigger
          inset
          disabled={deeplinks?.length === 0}
          className="data-disabled:opacity-50"
        >
          External links
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          {deeplinks?.map((d) => (
            <ContextMenuItem
              key={d.id}
              asChild
            >
              <Link
                to={d.template.replaceAll(
                  '{{ value }}',
                  displayValue.toString(),
                )}
                target="_blank"
              >
                {d.name}
              </Link>
            </ContextMenuItem>
          ))}
        </ContextMenuSubContent>
      </ContextMenuSub>
    </ContextMenuContentBase>
  );
};
