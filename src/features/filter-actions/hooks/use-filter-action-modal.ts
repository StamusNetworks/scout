import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  SendMailFilterAction,
  SuppressFilterAction,
  TagAndKeepFilterAction,
  TagFilterAction,
  ThreatFilterAction,
  ThresholdFilterAction,
} from '../model/filter-action';
import { selectFilterActionModal } from '../state/filter-action-modal.selectors';
import {
  closeFilterActionModal,
  FilterActionModalMode,
  openFilterActionModal,
} from '../state/filter-action-modal.slice';

type ModeAndAction<T> = { mode: FilterActionModalMode; filterAction?: T };

export const useFilterActionModal = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectFilterActionModal);

  return {
    state,
    openDeclaration: ({
      mode,
      filterAction,
    }: ModeAndAction<ThreatFilterAction>) =>
      dispatch(
        openFilterActionModal({ kind: 'declaration', mode, filterAction }),
      ),
    openSuppress: ({
      mode,
      filterAction,
    }: ModeAndAction<SuppressFilterAction>) =>
      dispatch(openFilterActionModal({ kind: 'suppress', mode, filterAction })),
    openTag: ({
      mode,
      keep,
      filterAction,
    }: ModeAndAction<TagFilterAction | TagAndKeepFilterAction> & {
      keep: boolean;
    }) =>
      dispatch(
        openFilterActionModal({ kind: 'tag', mode, keep, filterAction }),
      ),
    openThreshold: ({
      mode,
      filterAction,
    }: ModeAndAction<ThresholdFilterAction>) =>
      dispatch(
        openFilterActionModal({ kind: 'threshold', mode, filterAction }),
      ),
    openSendMail: ({
      mode,
      filterAction,
    }: ModeAndAction<SendMailFilterAction>) =>
      dispatch(openFilterActionModal({ kind: 'sendMail', mode, filterAction })),
    close: () => dispatch(closeFilterActionModal()),
  };
};
