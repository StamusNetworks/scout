import { isEmpty } from 'ramda';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { StatsBlock } from '@/common/design-system/atoms/page-stats';
import { Button } from '@/common/design-system/atoms/ui/button';
import { Card } from '@/common/design-system/atoms/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/common/design-system/atoms/ui/dialog';
import { ScrollArea } from '@/common/design-system/atoms/ui/scroll-area';
import { Separator } from '@/common/design-system/atoms/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/design-system/atoms/ui/table';
import { DateTime } from '@/common/design-system/entities/date-time';
import { FormattedBadge } from '@/common/design-system/molecules/formatted-badge';
import { Event } from '@/features/events/common/events.model';
import { EventValue } from '@/features/filtering/query-filters/use-cases/interactive-value/event-value';
import { KillchainTag } from '@/features/threats/common/killchain/components/killchain-tag';
import { ThreatTag } from '@/features/threats/common/molecules/threat-tag';

import { getViewModel, type MetaViewItem } from './meta-view.data-preparation';

export const MetaViewTemplate = ({
  viewModel,
  event,
}: {
  viewModel: ReturnType<typeof getViewModel>;
  event: Event;
}) => (
  <div className="mt-4">
    <div className="flex flex-col items-center border-b p-3">
      <h6 className="text-sm font-bold">Flow start</h6>
      <div className="text-xs">
        {viewModel.flow?.start && <DateTime date={viewModel.flow.start} />}
      </div>
    </div>
    <Grid className="grid-cols-[1fr_min-content_1fr] gap-5">
      <Row className="py-2 text-xs">
        <EventValue
          query_key="proto"
          value={event.proto}
        />
        /
        <EventValue
          query_key={event.flow?.src_port ? 'flow.src_port' : 'src_port'}
          value={event.flow?.src_port || event.src_port}
        />
      </Row>
      <div className="bg-foreground/10 relative z-1 h-full w-px"></div>
      <Row className="py-2 text-xs">
        <EventValue
          query_key="proto"
          value={event.proto}
        />
        /
        <EventValue
          query_key={event.flow?.dest_port ? 'flow.dest_port' : 'dest_port'}
          value={event.flow?.dest_port || event.dest_port}
        />
      </Row>
    </Grid>
    {viewModel.items
      ?.filter((item) => item !== undefined)
      .map((item, i) => (
        <Grid
          className="grid-cols-[1fr_min-content_1fr] gap-5"
          key={i}
        >
          <div className="min-w-0 flex-1 py-2">
            {item.direction === 'to_server' ? (
              <TransactionContent transaction={item} />
            ) : (
              <Row className="justify-end text-sm">
                {item.start && <DateTime date={item.start} />}
              </Row>
            )}
          </div>
          <div className="bg-foreground/10 relative z-1 h-full w-px">
            <div className="bg-border absolute top-4 z-2 size-2 -translate-x-1/2 rounded-full" />
          </div>
          <div className="min-w-0 flex-1 py-2">
            {item.direction === 'to_client' ? (
              <TransactionContent transaction={item} />
            ) : (
              <Row className="text-sm">
                {item.start && <DateTime date={item.start} />}
              </Row>
            )}
          </div>
        </Grid>
      ))}
    <div className="flex flex-col items-center border-t p-3">
      <h6 className="text-sm font-bold">Flow end</h6>
      <div className="mb-2 text-xs">
        {viewModel.flow?.end && <DateTime date={viewModel.flow.end} />}
      </div>
      <Row className="justify-center gap-5">
        <StatsBlock
          label="Packets To Server"
          value={viewModel.flow?.pkts_toserver}
        />
        <StatsBlock
          label="Bytes To Server"
          value={viewModel.flow?.bytes_toserver}
        />
        <StatsBlock
          label="Duration"
          value={viewModel.flow?.duration}
        />
        <StatsBlock
          label="Packets To Client"
          value={viewModel.flow?.pkts_toclient}
        />
        <StatsBlock
          label="Bytes To Client"
          value={viewModel.flow?.bytes_toclient}
        />
      </Row>
    </div>
  </div>
);

const TransactionContent = ({ transaction }: { transaction: MetaViewItem }) =>
  !transaction ? null : transaction.type === 'alert' ? (
    <Card
      className="flex flex-col gap-1 p-3"
      variant="alert"
    >
      <EventValue
        query_key="alert.signature"
        className="text-sm"
        value={transaction.signature}
      />
    </Card>
  ) : transaction.type === 'dns-answer' ? (
    <Card
      className="flex flex-col gap-1 p-3"
      variant="base"
    >
      <Column className="mb-1 gap-2 empty:hidden">
        <DnsInfo dns={transaction.dns} />
      </Column>
    </Card>
  ) : transaction.type === 'stamus' ? (
    <Card
      className="flex flex-col gap-1 p-3"
      variant={
        transaction.stamus.every((s) => s.kill_chain === 'pre_condition')
          ? 'dopv'
          : 'doc'
      }
    >
      <h6 className="text-sm font-bold">
        Stamus{' '}
        <FormattedBadge
          variant="secondary"
          value={transaction.stamus.length}
          className="px-1.5 py-0.5"
        />
      </h6>
      <Column className="gap-1 text-sm">
        {transaction.stamus.map((s) => (
          <Row
            key={s.threat_id}
            className="gap-2"
          >
            <ThreatTag threat_id={s.threat_id} />
            <KillchainTag kc={s.kill_chain_offender || s.kill_chain} />
            <EventValue
              query_key="alert.signature"
              value={s.signature}
            />
          </Row>
        ))}
      </Column>
    </Card>
  ) : (
    <Card
      className="flex flex-col gap-1 p-3"
      variant={
        !isEmpty(transaction.stamus || [])
          ? transaction.stamus.every((s) => s.kill_chain === 'pre_condition')
            ? 'dopv'
            : 'doc'
          : transaction.alerts && transaction.alerts.length > 0
            ? 'alert'
            : 'base'
      }
    >
      <Column className="mb-1 gap-2 empty:hidden">
        <HttpInfo http={transaction.http} />
        <TlsInfo tls={transaction.tls} />
        <SmbInfo smb={transaction.smb} />
        <FileinfoInfo fileinfo={transaction.fileinfo} />
        <DnsInfo dns={transaction.dns} />
      </Column>
      {transaction.stamus && transaction.stamus.length > 0 && (
        <>
          {(transaction.http ||
            transaction.tls ||
            transaction.smb ||
            transaction.fileinfo ||
            transaction.dns) && <Separator className="my-1" />}
          <h6 className="text-sm font-bold">
            Stamus{' '}
            <FormattedBadge
              variant="secondary"
              value={transaction.stamus.length}
              className="px-1.5 py-0.5"
            />
          </h6>
          <Column className="gap-1 text-sm">
            {transaction.stamus.map((s) => (
              <Row
                key={s.threat_id}
                className="gap-2"
              >
                <ThreatTag threat_id={s.threat_id} />
                <KillchainTag kc={s.kill_chain_offender || s.kill_chain} />
                <EventValue
                  query_key="alert.signature"
                  value={s.signature}
                />
              </Row>
            ))}
          </Column>
        </>
      )}
      {transaction.alerts && transaction.alerts.length > 0 && (
        <>
          <Separator className="my-1" />
          <h6 className="text-sm font-bold">
            Alerts{' '}
            <FormattedBadge
              variant="secondary"
              value={transaction.alerts.length}
              className="px-1.5 py-0.5"
            />
          </h6>
          <div className="text-sm">
            {transaction.alerts.map((a) => (
              <EventValue
                query_key="alert.signature"
                value={a.signature}
                key={a.signature}
              />
            ))}
          </div>
        </>
      )}
    </Card>
  );

const HttpInfo = ({
  http,
}: {
  http?:
    | {
        host: string | undefined;
        method: string | undefined;
        url: string | undefined;
        protocol: string | undefined;
        response_body: string | undefined;
        request_body: string | undefined;
        payload_printable: string | undefined;
      }
    | undefined;
}) =>
  !http ? null : (
    <Row className="gap-6">
      <StatsBlock
        label="HTTP Host"
        value={
          <EventValue
            query_key="http.hostname"
            value={http.host}
            className="line-clamp-3 text-wrap break-all"
          />
        }
      />
      <StatsBlock
        label="HTTP Method"
        value={
          <EventValue
            query_key="http.http_method"
            value={http.method}
          />
        }
      />
      <StatsBlock
        label="HTTP URL"
        value={
          <EventValue
            query_key="http.url"
            value={http.url}
            className="line-clamp-3 max-w-60 text-wrap break-all"
          />
        }
      />
      <StatsBlock
        label="Protocol"
        value={
          <EventValue
            query_key="http.protocol"
            value={http.protocol}
            className="line-clamp-3 text-wrap break-all"
          />
        }
      />
      <StatsBlock
        label="HTTP Response Body"
        value={
          http.response_body ? (
            <PreDialog title="HTTP Response Body">
              {http.response_body}
            </PreDialog>
          ) : null
        }
      />
      <StatsBlock
        label="HTTP Request Body"
        value={
          http.request_body ? (
            <PreDialog title="HTTP Request Body">{http.request_body}</PreDialog>
          ) : null
        }
      />
      <StatsBlock
        label="HTTP Payload"
        value={
          http.payload_printable ? (
            <PreDialog title="HTTP Payload">{http.payload_printable}</PreDialog>
          ) : null
        }
      />
    </Row>
  );

const TlsInfo = ({
  tls,
}: {
  tls?:
    | {
        sni: string | undefined;
        version: string | undefined;
        subject: string | undefined;
      }
    | undefined;
}) =>
  !tls ? null : (
    <Row className="gap-2">
      <StatsBlock
        label="TLS SNI"
        value={
          <EventValue
            query_key="tls.sni"
            value={tls.sni}
          />
        }
      />
      <StatsBlock
        label="TLS Version"
        value={
          <EventValue
            query_key="tls.version"
            value={tls.version}
          />
        }
      />
      <StatsBlock
        label="TLS Subject DN"
        value={
          <EventValue
            query_key="tls.subject"
            value={tls.subject}
          />
        }
      />
    </Row>
  );

const SmbInfo = ({
  smb,
}: {
  smb?:
    | {
        command: string | undefined;
        endpoint: string | undefined;
        interface: string | undefined;
        status: string | undefined;
        ntlmssp?: {
          user: string | undefined;
        };
        dcerpc?: {
          endpoint: string | undefined;
          interface: string | undefined;
        };
      }
    | undefined;
}) =>
  !smb ? null : (
    <Row className="gap-2">
      <StatsBlock
        label="Command"
        value={
          <EventValue
            query_key="smb.command"
            value={smb.command}
          />
        }
      />
      <StatsBlock
        label="User"
        value={
          <EventValue
            query_key="smb.ntlmssp.user"
            value={smb.ntlmssp?.user}
            className="line-clamp-3 text-wrap break-all"
          />
        }
      />
      <StatsBlock
        label="Status"
        value={
          <EventValue
            query_key="smb.status"
            value={smb.status}
            className="line-clamp-3 text-wrap break-all"
          />
        }
      />
      <StatsBlock
        label="Endpoint"
        value={
          <EventValue
            query_key="smb.dcerpc.endpoint"
            value={smb.dcerpc?.endpoint}
            className="line-clamp-3 text-wrap break-all"
          />
        }
      />
      <StatsBlock
        label="Interface"
        value={
          <EventValue
            query_key="smb.dcerpc.interface"
            value={smb.dcerpc?.interface}
            className="line-clamp-3 text-wrap break-all"
          />
        }
      />
    </Row>
  );

const FileinfoInfo = ({
  fileinfo,
}: {
  fileinfo?:
    | {
        filename: string | undefined;
        mimetype: string | undefined;
        size: number | undefined;
        sha256: string | undefined;
      }[]
    | undefined;
}) =>
  !fileinfo || fileinfo.length === 0 ? null : (
    <Table>
      <TableHeader className="[&_th]:h-6 [&_th]:p-1 [&_th]:text-xs [&_th]:font-bold">
        <TableHead>File Name</TableHead>
        <TableHead>File Type</TableHead>
        <TableHead>File Size</TableHead>
        <TableHead>File SHA256</TableHead>
      </TableHeader>
      <TableBody>
        {fileinfo.map((f) => (
          <TableRow
            key={f.filename}
            className="[&_td]:p-1"
          >
            <TableCell>
              <EventValue
                query_key="fileinfo.filename"
                value={f.filename}
                className="line-clamp-2 text-wrap wrap-anywhere"
              />
            </TableCell>
            <TableCell>
              <EventValue
                query_key="fileinfo.mimetype"
                value={f.mimetype}
                className="line-clamp-2 text-wrap wrap-anywhere"
              />
            </TableCell>
            <TableCell>
              <EventValue
                query_key="fileinfo.size"
                value={f.size}
              />
            </TableCell>
            <TableCell>
              <EventValue
                query_key="fileinfo.sha256"
                value={f.sha256}
                className="line-clamp-2 text-wrap wrap-anywhere"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

const DnsInfo = ({
  dns,
}: {
  dns?:
    | {
        id: string | number;
        queries?: {
          rrname: string;
          rrtype: string;
          opcode: number;
          tx_id: number;
          type: string;
        }[];
        answers?: {
          rrname: string;
          rrtype: string;
          ttl: number;
          rdata: string;
        }[];
      }
    | undefined;
}) =>
  !dns ? null : (
    <Column className="gap-2">
      {dns.queries && dns.queries.length > 0 && (
        <Table>
          <TableHeader className="[&_th]:h-6 [&_th]:p-1 [&_th]:text-xs [&_th]:font-bold">
            <TableHead>RRName</TableHead>
            <TableHead>RRType</TableHead>
            <TableHead>ID</TableHead>
          </TableHeader>
          <TableBody>
            {dns.queries.map((q) => (
              <TableRow key={q.rrname}>
                <TableCell>{q.rrname}</TableCell>
                <TableCell>{q.rrtype}</TableCell>
                <TableCell>{dns.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {dns.answers && dns.answers.length > 0 && (
        <Table>
          <TableHeader className="[&_th]:h-6 [&_th]:p-1 [&_th]:text-xs [&_th]:font-bold">
            <TableHead>RRName</TableHead>
            <TableHead>RRType</TableHead>
            <TableHead>RData</TableHead>
            <TableHead>ID</TableHead>
          </TableHeader>
          <TableBody>
            {dns.answers.map((a) => (
              <TableRow key={a.rrname}>
                <TableCell>{a.rrname}</TableCell>
                <TableCell>{a.rrtype}</TableCell>
                <TableCell>{a.rdata}</TableCell>
                <TableCell>{dns.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Column>
  );

const PreDialog = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Dialog>
    <DialogTrigger>
      <Button
        variant="outline"
        size="sm"
      >
        Open
      </Button>
    </DialogTrigger>
    <DialogContent
      aria-describedby={undefined}
      className="w-fit max-w-3/5 p-0"
    >
      <ScrollArea className="max-h-[500px] overflow-clip p-4">
        <DialogTitle className="mb-4">{title}</DialogTitle>
        <pre className="break-all whitespace-pre-wrap">{children}</pre>
      </ScrollArea>
    </DialogContent>
  </Dialog>
);
