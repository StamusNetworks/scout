import { GlobalCommand } from '@/features/app-shell';
import {
  DeclarationModal,
  SendMailModal,
  SuppressModal,
  TagModal,
  ThresholdModal,
} from '@/features/filter-actions';
import { SaveFilterSetModal } from '@/features/filter-sets';
import { AddQfilterCommand } from '@/features/query-filters/components/add-qfilter-command/add-qfilter-command';
import { AddEsFilterModal } from '@/features/query-filters/components/add-qfilter-modal/add-es-filter.modal';

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
