import { useState } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Button } from '@/common/design-system/atoms/ui/button';
import { Separator } from '@/common/design-system/atoms/ui/separator';
import { HtmlCodeDisplay } from '@/common/design-system/molecules/htmlCodeDisplay/htmlCodeDisplay';

import { Rule } from '../../model/signature';
import { Badge } from './components/badge';
import { Card, CardName, CardTitle, EngineMatches } from './components/card';
import { LabelValue } from './components/label-value';
import { MatchTemplate } from './components/matches/match';
import { getRuleData } from './signature-analysis.utils';

export const SignatureAnalysis = ({ rule }: { rule: Rule }) => {
  const [showOriginal, setShowOriginal] = useState(false);

  if (!rule.analysis) return null;

  const {
    generalData,
    engines,
    metadata,
    references,
    payload,
    packet,
    postmatch,
    threshold,
  } = getRuleData(rule);

  return (
    <Column className="gap-2">
      <Grid className="grid-cols-3 gap-2">
        <Card>
          <CardTitle>
            <CardName>General Information</CardName>
          </CardTitle>
          <Grid className="grid-cols-2 gap-2">
            <LabelValue
              label="Origin IP"
              value={generalData.originIp}
            />
            <LabelValue
              label="Destination IP"
              value={generalData.destinationIp}
            />
            <LabelValue
              label="Origin Port"
              value={generalData.originPort}
            />
            <LabelValue
              label="Destination Port"
              value={generalData.destinationPort}
            />
          </Grid>
          <Separator className="my-2" />
          <Grid className="grid-cols-2 gap-2">
            <LabelValue
              label="Class-Type"
              value={generalData.classtype}
            />
            <div />
            <LabelValue
              label="Protocol"
              value={generalData.protocol}
            />
            <LabelValue
              label="Revision"
              value={generalData.rev}
            />
          </Grid>
        </Card>
        <Card>
          <CardTitle>
            <CardName>Metadata</CardName>
          </CardTitle>
          <Grid className="grid-cols-2 gap-2">
            {metadata.map((item) => (
              <LabelValue
                key={item.label}
                label={item.label}
                value={item.value}
              />
            ))}
          </Grid>
        </Card>
        <Card>
          <CardTitle>
            <CardName>References</CardName>
          </CardTitle>
          <Column className="gap-2">
            {references.map((item) => (
              <LabelValue
                key={item.label}
                label={item.label}
                value={item.value}
                link={item.link}
              />
            ))}
          </Column>
        </Card>
      </Grid>
      {(engines?.length > 0 || payload || packet) && (
        <Grid className="grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-2">
          {payload && (
            <Card>
              <CardTitle>
                <CardName>Payload</CardName>
              </CardTitle>
              <EngineMatches>
                {payload.matches?.map((match, i) => (
                  <MatchTemplate
                    key={match.name + i}
                    match={match}
                  />
                ))}
              </EngineMatches>
            </Card>
          )}
          {packet && (
            <Card>
              <CardTitle>
                <CardName>Packet</CardName>
              </CardTitle>
              <EngineMatches>
                {packet.matches?.map((match, i) => (
                  <MatchTemplate
                    key={match.name + i}
                    match={match}
                  />
                ))}
              </EngineMatches>
            </Card>
          )}
          {postmatch && (
            <Card>
              <CardTitle>
                <CardName>Postmatch</CardName>
              </CardTitle>
              <EngineMatches>
                {postmatch.matches?.map((match, i) => (
                  <MatchTemplate
                    key={match.name + i}
                    match={match}
                  />
                ))}
              </EngineMatches>
            </Card>
          )}
          {threshold && (
            <Card>
              <CardTitle>
                <CardName>Postmatch</CardName>
              </CardTitle>
              <EngineMatches>
                {threshold.matches?.map((match, i) => (
                  <MatchTemplate
                    key={match.name + i}
                    match={match}
                  />
                ))}
              </EngineMatches>
            </Card>
          )}
          {engines?.map((engine) => (
            <Card key={engine.name}>
              <CardTitle className="mb-0.5 items-center gap-0.5">
                <CardName className="mr-1">Engine: {engine.name}</CardName>
                {engine.transforms?.map((transform) => (
                  <Badge
                    key={transform.name}
                    variant="transform"
                    className="inline-flex"
                  >
                    {transform.name}
                  </Badge>
                ))}
              </CardTitle>
              <EngineMatches>
                {engine?.matches?.map((match, i) => (
                  <MatchTemplate
                    key={match.name + i}
                    match={match}
                  />
                ))}
              </EngineMatches>
            </Card>
          ))}
        </Grid>
      )}
      <Column className="gap-2">
        <Button
          onClick={() => setShowOriginal(!showOriginal)}
          variant="secondary"
          className="w-fit"
        >
          Show raw detection method
        </Button>
        {showOriginal && (
          <HtmlCodeDisplay
            key={rule.id}
            innerHtml={rule.content_html}
          />
        )}
      </Column>
    </Column>
  );
};
