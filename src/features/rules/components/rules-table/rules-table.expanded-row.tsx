import { Row as TanstackRow } from '@tanstack/react-table';
import { useState } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { SwitchFilter } from '@/common/design-system/molecules/data-table/filters/switch-filter';
import { HtmlCodeDisplay } from '@/common/design-system/molecules/html-code-display/html-code-display';
import {
  DataEntry,
  ValueListCard,
} from '@/common/design-system/molecules/value-list-card';
import { useGetDashboardFieldsQuery } from '@/features/events';
import { KillchainTag } from '@/features/threats';
import { ThreatTag } from '@/features/threats';

import { useRuleDetailsParams } from '../../hooks/use-rule-details-params';
import { Rule } from '../../model/rule';
import { RuleAnalysis } from '../rule-analysis';
import { RuleFlow } from '../rule-flow/rule-flow';
import { RuleRulesetStatus } from '../rule-ruleset-status/rule-ruleset-status';
import { RuleTimeline } from '../rule-timeline/rule-timeline';

type FieldStats = {
  'flow.src_ip': DataEntry[];
  'flow.dest_ip': DataEntry[];
  'stamus.asset': DataEntry[];
  'stamus.source': DataEntry[];
};

export const RuleExpandedRow = ({ row }: { row: TanstackRow<Rule> }) => (
  <RuleExpandedRowTemplate rule={row.original} />
);

export const RuleExpandedRowTemplate = ({ rule }: { rule: Rule }) => {
  const [applyGlobalFilters, setApplyGlobalFilters] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const { data } = useCardsStats(rule.id, applyGlobalFilters);
  const formattedData = data as FieldStats;

  return (
    <Column className="gap-3 p-2 text-sm">
      <Row className="justify-between">
        <div>
          {rule.method &&
            Object.keys(rule.method).length > 0 &&
            rule.method.killChainPhase && (
              <Row className="mt-1 gap-2">
                Method for{' '}
                <ThreatTag
                  threat_id={rule.method.threatId}
                  kill_chain={rule.method.killChainPhase}
                />{' '}
                in stage <KillchainTag kc={rule.method.killChainPhase} />
              </Row>
            )}
        </div>
        <RuleRulesetStatus ruleId={rule.id} />
      </Row>

      {rule.versions?.length > 0 && <RuleAnalysis rule={rule.versions[0]} />}

      <Row className="gap-4">
        <Button
          variant="outline"
          onClick={() => setShowOriginal((prev) => !prev)}
          size="sm"
          className="w-24"
        >
          {!showOriginal ? 'Show' : 'Hide'} raw
        </Button>
        <SwitchFilter
          value={applyGlobalFilters}
          setValue={setApplyGlobalFilters}
          title="Apply Global Filters"
        />
      </Row>
      <RuleContent
        content={rule.versions[0].contentHtml}
        open={showOriginal}
      />
      <RuleFlow
        sid={rule.id}
        methodType={rule.method?.methodType}
        applyGlobalFilters={applyGlobalFilters}
      />
      <RuleTimeline
        sid={rule.id}
        applyGlobalFilters={applyGlobalFilters}
      />
      <Grid className="grid-cols-4 gap-2">
        <ValueListCard
          es_key="src_ip"
          title="Source IP"
          data={formattedData?.['flow.src_ip']}
        />
        <ValueListCard
          es_key="dest_ip"
          title="Destination IP"
          data={formattedData?.['flow.dest_ip']}
        />
        <ValueListCard
          es_key="stamus.asset"
          title="Entity"
          data={formattedData?.['stamus.asset']}
        />
        <ValueListCard
          es_key="stamus.source"
          title="Source"
          data={formattedData?.['stamus.source']}
        />
      </Grid>
    </Column>
  );
};

const useCardsStats = (sid: number, applyGlobalFilter: boolean) => {
  const params = useRuleDetailsParams(sid, applyGlobalFilter);
  return useGetDashboardFieldsQuery({
    ...params,
    fields: 'flow.src_ip,flow.dest_ip,stamus.asset,stamus.source',
  });
};

const RuleContent = ({ open, content }: { open: boolean; content: string }) =>
  open && <HtmlCodeDisplay innerHtml={content} />;
