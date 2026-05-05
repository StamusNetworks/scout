import { useMemo } from 'react';
import { toast } from 'sonner';

import { DataTable } from '@/common/design-system/molecules/data-table';
import {
  useGetEventFilesInfoQuery,
  useLazyGetEventFileRetrieveQuery,
} from '@/features/events/common/events.api';

import { EventFileInfo } from '../../model/event-types/fileinfo.schema';
import { getColumns } from './files-table.columns';

export const Files = ({
  files,
}: {
  files: Array<EventFileInfo & { host: string }>;
}) => {
  const { data: availableFiles = [], isLoading: isLoadingTable } =
    useGetEventFilesInfoQuery(
      files.map((f) => ({ host: f.host, sha256: f.sha256 })),
    );

  const [trigger, { isLoading: isDownloading }] =
    useLazyGetEventFileRetrieveQuery();

  const onDownload = async (file: EventFileInfo & { host: string }) => {
    const { data } = await trigger({
      host: file.host,
      sha256: file.sha256,
    });

    if (data?.retrieve === 'done') {
      toast.info('Downloading file...', {
        description: (
          <>
            host: {file.host}
            <br />
            sha256: {file.sha256}
          </>
        ),
      });

      // trigger the download dialog
      const element = document.createElement('a');
      element.setAttribute(
        'href',
        `/rest/rules/filestore/${file.sha256}/download/`,
      );
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      toast.error('Error downloading file', {
        description: 'File could not be downloaded',
      });
    }
  };

  const data = useMemo(
    () =>
      isLoadingTable
        ? {
            results: files,
            count: files.length,
          }
        : {
            results: files.filter(
              (_, index) => availableFiles[index]?.status === 'available',
            ),
            count: files.filter(
              (_, index) => availableFiles[index]?.status === 'available',
            ).length,
          },
    [files, isLoadingTable, availableFiles],
  );

  return (
    <div>
      <DataTable
        data={data}
        columns={getColumns(isDownloading, onDownload)}
        serverSide={false}
      />
      <div className="p-2 text-center text-red-500">
        WARNING: These extracted files can contain malware or malicious
        payloads! DO NOT execute, run or activate those in non protected or non
        sand boxed environments. Stamus Networks is not responsible for any
        damage to your systems and infrastructure that might occur as a
        consequence of downloading them.
      </div>
    </div>
  );
};
