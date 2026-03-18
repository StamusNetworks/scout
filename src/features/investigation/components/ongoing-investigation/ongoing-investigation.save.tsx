import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/common/design-system/atoms/ui/dialog';
import { FormItem } from '@/common/design-system/atoms/ui/form';
import { Input } from '@/common/design-system/atoms/ui/input';
import { Label } from '@/common/design-system/atoms/ui/label';
import { MultiSelect } from '@/common/design-system/atoms/ui/multi-select';
import { ScrollArea } from '@/common/design-system/atoms/ui/scroll-area';
import { Separator } from '@/common/design-system/atoms/ui/separator';
import { Textarea } from '@/common/design-system/atoms/ui/textarea';
import {
  DataEntry,
  ValueListCard,
} from '@/common/design-system/molecules/value-list-card';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import {
  selectQueryFilters,
  selectTagFilters,
} from '@/features/filtering/query-filters/store/query-filters.selector';
import { getFilterLabel } from '@/features/filtering/query-filters/utils/get-filter-label';
import { useGetDashboardFieldsQuery } from '@/features/events/detection-events/use-cases/explorer/api/dashboard.api';
import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  continueInvestigation,
  selectInvestigationFindingsKeys,
  selectInvestigationStage,
  selectInvestigationStages,
  selectStageIsValidToContinue,
  terminateInvestigation,
} from '../../investigation.slice';
import {
  addInvestigation,
  selectCurrentSave,
  updateCurrentSaveComment,
  updateCurrentSaveName,
  updateCurrentSaveTags,
} from '../../investigations-history.slice';
import { InvestigationParams } from '../investigation-details/investigation-params';
import { InvestigationResults } from '../investigation-details/investigation-results';
import { InvestigationStage } from '../investigation-details/investigation-stage';

export const inventoryHistoryOptions = [
  { label: 'ioc', value: 'ioc' },
  { label: 'dangerous', value: 'dangerous' },
  { label: 'suspicious', value: 'suspicious' },
];

export const SaveInvestigation = () => {
  const dispatch = useAppDispatch();
  const { start_date, end_date } = useGlobalQueryParams(['dates']);
  const tagFilters = useAppSelector(selectTagFilters);
  const queryFilters = useAppSelector(selectQueryFilters);
  const resultKeys = useAppSelector(selectInvestigationFindingsKeys);
  const investigationStages = useAppSelector(selectInvestigationStages);
  const stage = useAppSelector(selectInvestigationStage);
  const canContinue = useAppSelector(selectStageIsValidToContinue);
  const { comment, name, tags } = useAppSelector(selectCurrentSave);
  const [iocData, setIocData] = useState<
    { key: string; values: DataEntry[] }[]
  >([]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="h-fit grow py-1"
          onClick={() => {
            if ((stage === 'new' || typeof stage === 'number') && canContinue)
              dispatch(continueInvestigation());
          }}
        >
          <Save />
          Save
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="w-fit max-w-5xl p-0"
      >
        <ScrollArea className="flex h-fit max-h-[calc(100vh-40px)] flex-col overflow-auto">
          <div className="space-y-4 p-4">
            <DialogTitle className="mb-4">Save investigation</DialogTitle>
            <InvestigationParams
              startDate={start_date!}
              endDate={end_date!}
              tags={tagFilters}
              qfilter={queryFilters}
            />
            <Separator className="my-4" />
            {investigationStages.map((iStage, index) => (
              <InvestigationStage
                key={index}
                stage={iStage}
                index={index}
                showOnlyKept={false}
              />
            ))}
            <InvestigationResults
              resultsCount={resultKeys.length}
              slot={resultKeys.map((key) => (
                <ResultsDetails
                  key={key}
                  es_key={key}
                  setIocData={setIocData}
                />
              ))}
            />
            <Row className="gap-4">
              <FormItem className="mt-4">
                <Label>Name</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    dispatch(updateCurrentSaveName(e.target.value))
                  }
                />
              </FormItem>
              <FormItem className="mt-4">
                <Label>Tags</Label>
                <MultiSelect
                  defaultValue={tags}
                  options={inventoryHistoryOptions}
                  onValueChange={(value) =>
                    dispatch(updateCurrentSaveTags(value))
                  }
                  className="min-h-9 shadow-xs"
                />
              </FormItem>
            </Row>
            <FormItem className="mt-4">
              <Label>Comment</Label>
              <Textarea
                value={comment}
                onChange={(e) =>
                  dispatch(updateCurrentSaveComment(e.target.value))
                }
              />
            </FormItem>
            <Row className="mt-4 justify-end gap-2">
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  onClick={() => {
                    dispatch(
                      addInvestigation({
                        initialParams: {
                          start_date,
                          end_date,
                          qfilter: queryFilters,
                          tags: tagFilters ?? undefined,
                        },
                        results: iocData,
                        stages: investigationStages,
                        name,
                        tags,
                        comment,
                      }),
                    );
                    dispatch(terminateInvestigation());
                  }}
                  disabled={iocData.length !== resultKeys.length}
                >
                  Save
                </Button>
              </DialogClose>
            </Row>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const ResultsDetails = ({
  es_key,
  setIocData,
}: {
  es_key: string;
  setIocData: React.Dispatch<
    React.SetStateAction<{ key: string; values: DataEntry[] }[]>
  >;
}) => {
  const params = useGlobalQueryParams(['qfilter', 'dates', 'tenant']);
  const { data } = useGetDashboardFieldsQuery({
    ...params,
    fields: es_key,
    page_size: 1000000,
  });

  useEffect(() => {
    if (!data?.[es_key]) return;
    setIocData((prev) => [
      ...prev.filter((item) => item.key !== es_key),
      { key: es_key, values: data?.[es_key] },
    ]);
  }, [data, setIocData, es_key]);

  return (
    <ValueListCard
      es_key={es_key}
      title={getFilterLabel(es_key)}
      data={data?.[es_key]}
      maxItems={5}
    />
  );
};
