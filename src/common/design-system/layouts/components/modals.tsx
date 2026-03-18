import { AddEsFilterModal } from '@/features/filtering/query-filters/components/add-es-filter/add-es-filter.modal';
import { AddQfilterCommand } from '@/features/filtering/query-filters/components/add-qfilter-command/add-qfilter-command';
import { SaveFilterSetModal } from '@/features/filtering/query-filters/components/save-filterset/save-filterset.dialog';
import { CreateEditDeclarationModal } from '@/features/hunt/filter-actions/components/filter-actions/create-edit-declaration-events/create-edit-declaration.modal';
import { CreateEditSuppressModal } from '@/features/hunt/filter-actions/components/filter-actions/create-edit-suppress-filter-action/create-edit-suppress.modal';
import { CreateEditTagModal } from '@/features/hunt/filter-actions/components/filter-actions/create-edit-tag-filter-action/create-edit-tag.modal';
import { CreateEditThresholdModal } from '@/features/hunt/filter-actions/components/filter-actions/create-edit-threshold-filter-filter-action/create-edit-threshold.modal';
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
    <AddEsFilterModal />
  </>
);
