import {
  ArrowUpDown,
  Copy,
  Filter,
  FilterX,
  LaptopMinimal,
  LayoutDashboard,
  Search,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
  ContextMenuContent as ContextMenuContentBase,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/common/design-system/atoms/ui/context-menu';
import { saveToClipboard } from '@/common/lib/save';
import { startsWithOneOf } from '@/common/lib/strings';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { useGetDeeplinksQuery } from '@/features/hunt/deeplinks/api/deeplinks.api';
import {
  addEvidence,
  selectCurrentInvestigationStage,
  selectInvestigationStage,
} from '@/features/hunt/investigation/investigation.slice';
import { routes } from '@/pages/routes.config';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { useQueryFilterDefinition } from '../../../hooks/use-filters-definitions';
import {
  addQueryFilter,
  replaceFilters,
} from '../../../store/query-filters.slice';
import { enableTags } from '../../../use-cases/enable-tags';
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
  const dispatch = useAppDispatch();
  const { data: deeplinksData } = useGetDeeplinksQuery({
    pageIndex: 0,
    pageSize: 1000000,
  });
  const filterDef = useQueryFilterDefinition(query_key);
  const deeplinks = useMemo(() => {
    if (!deeplinksData) return [];
    return deeplinksData.results.filter((deeplink) =>
      !deeplink.enabled
        ? false
        : deeplink.all ||
          (filterDef?.entity &&
            deeplink.entities
              .map((e) => e.name)
              .some((entity) =>
                Array.isArray(filterDef.entity)
                  ? filterDef.entity.includes(entity)
                  : filterDef.entity === entity,
              )),
    );
  }, [deeplinksData, filterDef]);
  const investigationStage = useAppSelector(selectInvestigationStage);
  const currentStage = useAppSelector(selectCurrentInvestigationStage);
  const { enterprise } = useFeatureFlags();
  return (
    <ContextMenuContentBase
      className="w-64"
      onClick={(e) => e.stopPropagation()} // When inside something with an onClick like a table row, prevents triggering it when clicking a menu option
      onCloseAutoFocus={(e) => e.preventDefault()} // When inside a tooltip, prevents reopening the tooltip when exiting the menu
      onFocus={(e) => e.preventDefault()} // When inside a toolip, prevents reopening the tooltip when hovering menu options
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
              dispatch(
                addEvidence({
                  key: query_key,
                  value,
                }),
              )
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
        onClick={() =>
          dispatch(addQueryFilter({ key: query_key, value: value }))
        }
      >
        <Filter className={iconClass} /> Filter on value
      </ContextMenuItem>
      <ContextMenuItem
        onClick={() =>
          dispatch(
            addQueryFilter({
              key: query_key,
              value,
              options: { is_negated: true },
            }),
          )
        }
      >
        <FilterX className={iconClass} />
        Filter on negated value
      </ContextMenuItem>
      <ContextMenuItem onClick={() => saveToClipboard(displayValue.toString())}>
        <Copy className={iconClass} />
        Copy to clipboard
      </ContextMenuItem>
      <ContextMenuSeparator />
      {!pathname.startsWith(routes.explorer) && (
        <ContextMenuItem
          onClick={() => {
            enableTags(dispatch);
            dispatch(replaceFilters([{ key: query_key, value }]));
            navigate(routes.explorer);
          }}
        >
          <LayoutDashboard className={iconClass} />
          Explore
        </ContextMenuItem>
      )}
      <ContextMenuItem
        onClick={() => {
          dispatch(replaceFilters([{ key: query_key, value }]));
          navigate(routes.session_events);
        }}
        disabled={startsWithOneOf(query_key, ['alert.', 'host_id.', 'stamus.'])}
      >
        <ArrowUpDown className={iconClass} />
        See transactions
      </ContextMenuItem>

      {enterprise && filterDef?.type === 'ip' && (
        <ContextMenuItem asChild>
          <Link to={`${routes.hosts}/${value}`}>
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
              key={d.pk}
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
