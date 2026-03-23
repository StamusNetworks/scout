import { esEscape } from '@/common/lib/strings';
import {
  useGetEventsQuery,
  useGetEventsTailQuery,
} from '@/features/events/common/events.api';
import { useGetSightingEventsQuery } from '@/features/events/sightings/common/sightings.api';

import { TaggedEvent } from '../hunting-trail.model';
import { aggregateTimelineEvents } from '../utils/aggregate-timeline-events';

interface UseHuntingTrailParams {
  asset: string;
  startDate: number | undefined;
  endDate: number | undefined;
}

export function useHuntingTrail({
  asset,
  startDate,
  endDate,
}: UseHuntingTrailParams) {
  const ipFilter = `src_ip:${esEscape(asset)} OR dest_ip:${esEscape(asset)}`;

  const nrd = useGetEventsQuery({
    qfilter: `(${ipFilter}) AND metadata.flowbits:stamus.nrd*`,
    start_date: startDate,
    end_date: endDate,
    page_size: 100,
    alert: true,
  });

  const sightings = useGetSightingEventsQuery({
    qfilter: `discovery.asset:${esEscape(asset)}`,
    start_date: startDate,
    end_date: endDate,
    page_size: 100,
  });

  const file = useGetEventsTailQuery({
    qfilter: `(${ipFilter}) AND (metadata.flowbits:stamus.file.identification OR metadata.flowbits:stamus.dga.smbfilename) AND event_type:fileinfo`,
    start_date: startDate,
    end_date: endDate,
    page_size: 100,
  });

  const lateral = useGetEventsQuery({
    qfilter: `(${ipFilter}) AND alert.lateral:* AND alert.metadata.source:smb_lateral AND alert.metadata.signature_severity:critical`,
    start_date: startDate,
    end_date: endDate,
    page_size: 100,
    alert: true,
  });

  const hunting = useGetEventsQuery({
    qfilter: `(${ipFilter}) AND alert.metadata.stamus_type:hunting`,
    start_date: startDate,
    end_date: endDate,
    page_size: 100,
    alert: true,
  });

  const queries = [nrd, sightings, file, lateral, hunting];
  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.every((q) => q.isError);

  const taggedEvents: TaggedEvent[] = [
    ...(nrd.data?.results ?? []).map((e) => ({
      ...e,
      timelineType: 'nrd' as const,
    })),
    ...(sightings.data?.results ?? []).map((e) => ({
      ...e,
      timelineType: 'sightings' as const,
    })),
    ...(file.data?.results ?? []).map((e) => ({
      ...e,
      timelineType: 'file' as const,
    })),
    ...(lateral.data?.results ?? []).map((e) => ({
      ...e,
      timelineType: 'lateral' as const,
    })),
    ...(hunting.data?.results ?? []).map((e) => ({
      ...e,
      timelineType: 'hunting' as const,
    })),
  ];

  const groups = aggregateTimelineEvents(taggedEvents);
  console.log(groups);
  return {
    groups,
    isLoading,
    isError,
    isEmpty: !isLoading && groups.length === 0 && !isError,
  };
}
