import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { formatDate } from 'date-fns';
import { AlertCircle, Check, X } from 'lucide-react';
import { last, values } from 'ramda';
import { useState } from 'react';
import { toast } from 'sonner';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/common/design-system/atoms/ui/alert';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/common/design-system/atoms/ui/dialog';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { VisuallyHidden } from '@/common/design-system/atoms/ui/visually-hidden';
import { cn } from '@/common/lib/utils';
import {
  useRequestPcapExtractionMutation,
  useRequestPcapUploadMutation,
  useUploadAlertToProbeMutation,
} from '@/features/events/common/events.api';
import { Event } from '@/features/events/common/events.model';

const steps = {
  1: 'Send PCAP extraction request to probe',
  2: 'Extract PCAP from probe',
  3: 'Create download link',
  4: 'Download PCAP',
};

export const Pcap = ({ event }: { event: Event }) => {
  const { downloadPcap, error, currentStep } = useDownloadPcap(event);

  return (
    <Column className="gap-2 px-2">
      <Alert>
        <AlertCircle />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Be careful when downloading. The PCAP can contain malicious,
          inappropriate, or illegal data!
        </AlertDescription>
      </Alert>
      <Row className="items-center gap-4">
        <Column>
          <h3 className="font-bold">Probe</h3>
          <p>{event.host}</p>
        </Column>
        <Column>
          <h3 className="font-bold">File</h3>
          <p>starting from {getPcapDate(event.capture_file!)}</p>
        </Column>
      </Row>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="w-fit"
            onClick={downloadPcap}
          >
            Download PCAP
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Download PCAP</DialogTitle>
          <VisuallyHidden>
            <DialogDescription>Download PCAP</DialogDescription>
          </VisuallyHidden>
          <Column className="gap-2">
            {values(steps).map((step, i) => (
              <div
                key={step}
                className={cn(
                  'flex items-center opacity-50',
                  i < currentStep && 'opacity-100',
                )}
              >
                {i + 1 < currentStep && (
                  <Check
                    size={20}
                    className="text-green-500"
                  />
                )}
                {i + 1 === currentStep &&
                  (error ? (
                    <X
                      size={20}
                      className="text-destructive"
                    />
                  ) : (
                    <Spin />
                  ))}
                <p className="ml-2">{step}</p>
              </div>
            ))}
          </Column>
          {error && (
            <Alert>
              <AlertCircle />
              <Row className="items-center justify-between gap-2">
                <Column>
                  <AlertTitle>Error downloading PCAP</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Column>
                <Button
                  onClick={downloadPcap}
                  size="sm"
                >
                  Try again
                </Button>
              </Row>
            </Alert>
          )}
        </DialogContent>
      </Dialog>
    </Column>
  );
};

const getPcapDate = (fileName: string) => {
  const unix = parseInt(last(fileName.split('/'))!.split('-')[1]) * 1000;
  return formatDate(new Date(unix), 'yyyy-MM-dd HH:mm:ss');
};

const useDownloadPcap = (event: Event) => {
  const [uploadAlertToProbe] = useUploadAlertToProbeMutation();
  const [requestPcapExtraction] = useRequestPcapExtractionMutation();
  const [requestPcapUpload] = useRequestPcapUploadMutation();

  const [step, setStep] = useState<number>(0);
  const [error, setError] = useState<string | undefined>();

  const downloadPcap = async () => {
    setError(undefined);

    // 1. Request PCAP extraction
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([JSON.stringify(event)], { type: 'application/json' }),
    );

    if (!event.host) {
      setError('Host is undefined');
      return;
    }

    try {
      setStep(1);
      await uploadAlertToProbe({
        host: event.host,
        event: formData,
      }).unwrap();

      setStep(2);
      await requestPcapExtraction({
        host: event.host,
        eventId: event._id,
      }).unwrap();

      setStep(3);
      await requestPcapUpload({
        host: event.host,
        eventId: event._id,
      }).unwrap();

      setStep(4);
      const href = `${window.config.apiUrl}/rest/rules/filestore_pcap/${event._id}/download/`;
      const element = document.createElement('a');
      element.setAttribute('href', href);
      element.setAttribute('download', 'export.pcap');
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      window.URL.revokeObjectURL(href);
      toast.success('Downloading the PCAP');
      setStep(5);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
      return;
    }
  };
  return {
    downloadPcap,
    error,
    currentStep: step,
  };
};

const isFetchBaseQueryErr = (
  error: unknown,
): error is FetchBaseQueryError & { data?: unknown } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'data' in error
  );
};

const getErrorMessage = (error: unknown) => {
  if (isFetchBaseQueryErr(error)) {
    const data = error.data;
    if (typeof data === 'object' && data && 'error' in data) {
      return String((data as { error?: unknown }).error);
    }
  }
  return error instanceof Error ? error.message : 'Failed to download PCAP';
};
