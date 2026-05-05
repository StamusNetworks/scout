import { CreateEditDeclarationModal } from '@/features/filter-actions/components/filter-actions/create-edit-declaration-events/create-edit-declaration.modal';
import { CreateEditSendMailModal } from '@/features/filter-actions/components/filter-actions/create-edit-send-mail-filter-action/create-edit-send-mail.modal';
import { CreateEditSuppressModal } from '@/features/filter-actions/components/filter-actions/create-edit-suppress-filter-action/create-edit-suppress.modal';
import { CreateEditTagModal } from '@/features/filter-actions/components/filter-actions/create-edit-tag-filter-action/create-edit-tag.modal';
import { CreateEditThresholdModal } from '@/features/filter-actions/components/filter-actions/create-edit-threshold-filter-filter-action/create-edit-threshold.modal';
import { SaveFilterSetModal } from '@/features/filter-sets';
import { AddQfilterCommand } from '@/features/query-filters/components/add-qfilter-command/add-qfilter-command';
import { AddEsFilterModal } from '@/features/query-filters/components/add-qfilter-modal/add-es-filter.modal';
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
