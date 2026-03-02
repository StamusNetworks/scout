import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { ScrollArea } from '@/common/design-system/atoms/ui/scroll-area';
import { DataTable } from '@/common/design-system/molecules/data-table';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { TableCard } from '@/common/design-system/molecules/table-card';
import { EventField } from '@/features/hunt/filtering/query-filters/components/event-field';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import { type Event } from '../../model/event.schema';
import { EventFileInfo } from '../../model/event-types/fileinfo.schema';
import { getSyntheticView } from './synthetic-view.config';

export const SyntheticView = ({ event }: { event: Event }) => {
  return (
    <div className="@container/synthetic-view">
      <Grid className="grid-cols-4 gap-2 @4xl/synthetic-view:grid-cols-6 @6xl/synthetic-view:grid-cols-8">
        {getSyntheticView(event)
          .filter((card) => !card.valid || card.valid(event))
          ?.map((card) => {
            const content = card.items
              .filter((item) => typeof item.value !== 'undefined')
              ?.map(({ key, value }) => {
                if (!Array.isArray(value) && !!value) {
                  return (
                    <EventField
                      key={key}
                      filterId={key}
                      value={value}
                    />
                  );
                } else if (Array.isArray(value)) {
                  const [items] = value;
                  return (items as { key: string; value: string }[])?.map(
                    (itemValue, itemKey) => {
                      return (
                        <EventField
                          key={itemKey}
                          filterId={itemValue.key}
                          value={itemValue.value}
                        />
                      );
                    },
                  );
                }
              });

            if (!content.length) return null;
            return (
              <TableCard
                title={card.title}
                key={card.title}
                data={[{ key: card.title, value: '' }, ...card.items]}
                className="col-span-(--col-span)"
                style={{ '--col-span': card.span || 2 } as React.CSSProperties}
              >
                <Column className="space-y-1">{content}</Column>
              </TableCard>
            );
          })}
      </Grid>
      {event.files && event.files.length > 0 && (
        <div className="my-4">
          <FilesTable files={event.files} />
        </div>
      )}
      <ScrollPreCard
        title="Payload printable"
        value={event.payload_printable}
      />
      {event.app_proto === 'http' && (
        <ScrollPreCard
          title="HTTP Response"
          value={event.http?.http_response_body_printable}
        />
      )}
      <ScrollPreCard
        title="HTTP Request"
        value={event.http?.http_request_body_printable}
      />
    </div>
  );
};

const ScrollPreCard = ({ title, value }: { title: string; value?: string }) =>
  value ? (
    <TableCard
      title={title}
      className="mt-2"
      headers={[title]}
      data={[
        {
          value,
        },
      ]}
    >
      <ScrollArea className="flex h-fit max-h-48 grow flex-col overflow-clip pr-4">
        <pre className="break-all whitespace-pre-wrap">{value}</pre>
      </ScrollArea>
    </TableCard>
  ) : null;

const FilesTable = ({ files }: { files: EventFileInfo[] }) => (
  <DataTable
    data={{
      results: files,
      count: files.length,
    }}
    columns={
      [
        {
          id: 'filename',
          header: 'Filename',
          cell: ({ row }) => (
            <div className="break-all">{row.original.filename}</div>
          ),
        },
        {
          id: 'mime_type',
          header: 'Mimetype',
          cell: ({ row }) => <div>{row.original.mimetype}</div>,
        },
        {
          id: 'size',
          header: 'Size',
          cell: ({ row }) => <div>{row.original.size}</div>,
        },
        {
          id: 'sha256',
          header: 'Sha256',
          cell: ({ row }) => (
            <EventValue
              query_key="files.sha256"
              value={row.original.sha256}
            />
          ),
        },
        {
          id: 'stored',
          header: 'Stored',
          cell: ({ row }) => <div>{row.original.stored ? 'Yes' : 'No'}</div>,
        },
      ] as CustomColumnDef<EventFileInfo>[]
    }
    serverSide={false}
  />
);
