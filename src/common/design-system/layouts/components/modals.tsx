import { DeclarationModal } from '@/features/filter-actions/components/declaration-modal/declaration-modal';
import { SendMailModal } from '@/features/filter-actions/components/send-mail-modal/send-mail-modal';
import { SuppressModal } from '@/features/filter-actions/components/suppress-modal/suppress-modal';
import { TagModal } from '@/features/filter-actions/components/tag-modal/tag-modal';
import { ThresholdModal } from '@/features/filter-actions/components/threshold-modal/threshold-modal';
import { SaveFilterSetModal } from '@/features/filter-sets';
import { AddQfilterCommand } from '@/features/query-filters/components/add-qfilter-command/add-qfilter-command';
import { AddEsFilterModal } from '@/features/query-filters/components/add-qfilter-modal/add-es-filter.modal';
import { GlobalCommand } from '@/features/ui/global-command/global-command';

export const Modals = () => (
  <>
    <GlobalCommand />
    <AddQfilterCommand />
    <SaveFilterSetModal />
    <SuppressModal />
    <ThresholdModal />
    <TagModal />
    <DeclarationModal />
    <SendMailModal />
    <AddEsFilterModal />
  </>
);
