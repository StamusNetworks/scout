import { CreateEditDeclarationModal } from '@/features/filter-actions/components/filter-actions/create-edit-declaration-events/create-edit-declaration.modal';
import { CreateEditSendMailModal } from '@/features/filter-actions/components/filter-actions/create-edit-send-mail-filter-action/create-edit-send-mail.modal';
import { CreateEditSuppressModal } from '@/features/filter-actions/components/filter-actions/create-edit-suppress-filter-action/create-edit-suppress.modal';
import { CreateEditTagModal } from '@/features/filter-actions/components/filter-actions/create-edit-tag-filter-action/create-edit-tag.modal';
import { CreateEditThresholdModal } from '@/features/filter-actions/components/filter-actions/create-edit-threshold-filter-filter-action/create-edit-threshold.modal';
import { SaveFilterSetModal } from '@/features/filtering/filtersets/use-cases/save-filter-set/save-filterset.dialog';
import { AddEsFilterModal } from '@/features/query-filters/use-cases/create-filter/add-es-filter.modal';
import { AddQfilterCommand } from '@/features/query-filters/use-cases/create-filter/add-qfilter-command';
import { GlobalCommand } from '@/features/ui/global-command/global-command';

export const Modals = () => (
  <>
    <GlobalCommand />
    <AddQfilterCommand />
    <SaveFilterSetModal />
    <CreateEditSuppressModal />
    <CreateEditThresholdModal />
    <CreateEditTagModal />
    <CreateEditDeclarationModal />
    <CreateEditSendMailModal />
    <AddEsFilterModal />
  </>
);
