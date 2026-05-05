import { last } from 'ramda';

import { ExternalLink } from '@/common/design-system/atoms/external-link';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { formatMitreString, getMitreTechniqueUrl } from '@/common/lib/mitre';
import { cn } from '@/common/lib/utils';
import { Event } from '@/features/events';

import { ProtoKey } from './proto-flow';

export const DetectionAttributes = ({
  eventsForProto,
  appProto,
}: {
  eventsForProto: Event[];
  appProto: ProtoKey;
}) => {
  const timestamps = eventsForProto.map((e) => e['@timestamp']).toSorted();
  const minTimestamp = timestamps[0];
  const maxTimestamp = last(timestamps);
  const metadata =
    'alert' in eventsForProto[0]
      ? eventsForProto[0]?.alert?.metadata
      : undefined;
  return (
    <Row className="mb-2 gap-2">
      <DetectionAttribute title="App proto">
        {appProto === 'default' ? 'unknown' : appProto.toUpperCase()}
      </DetectionAttribute>
      {!!minTimestamp && (
        <DetectionAttribute title="First seen">
          {new Date(minTimestamp).toLocaleString()}
        </DetectionAttribute>
      )}
      {!!maxTimestamp && (
        <DetectionAttribute title="Last seen">
          {new Date(maxTimestamp).toLocaleString()}
        </DetectionAttribute>
      )}
      {!!metadata?.mitre_tactic_name && (
        <DetectionAttribute title="MITRE Tactic Name">
          {metadata.mitre_tactic_id ? (
            <ExternalLink
              to={`https://attack.mitre.org/tactics/${metadata.mitre_tactic_id}`}
            >
              {formatMitreString(metadata.mitre_tactic_name[0])}
            </ExternalLink>
          ) : (
            formatMitreString(metadata.mitre_tactic_name[0])
          )}
        </DetectionAttribute>
      )}
      {!!metadata?.mitre_technique_name && (
        <DetectionAttribute title="MITRE Technique Name">
          {metadata.mitre_technique_id ? (
            <ExternalLink
              to={getMitreTechniqueUrl(metadata.mitre_technique_id[0])}
            >
              {formatMitreString(metadata.mitre_technique_name[0])}
            </ExternalLink>
          ) : (
            formatMitreString(metadata.mitre_technique_name[0])
          )}
        </DetectionAttribute>
      )}
    </Row>
  );
};

const DetectionAttribute = ({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <Column className={cn('bg-muted w-[200px] rounded-md px-2 py-2', className)}>
    <div className="text-muted-foreground text-xs font-bold">{title}</div>
    <div className="text-xs">{children}</div>
  </Column>
);
