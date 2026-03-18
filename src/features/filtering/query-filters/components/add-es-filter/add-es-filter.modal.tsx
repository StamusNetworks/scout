import { useMemo, useState } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/common/design-system/atoms/ui/dialog';
import { VisuallyHidden } from '@/common/design-system/atoms/ui/visually-hidden';
import { LuceneEditor } from '@/common/design-system/molecules/lucene-editor';
import { selectIsModalOpen, setOpenModal } from '@/features/ui/ui-state.slice';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { useQueryFiltersDefinitions } from '../../hooks/use-filters-definitions';
import { addQueryFilter } from '../../store/query-filters.slice';

export const AddEsFilterModal = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsModalOpen('addEsFilter'));
  const [query, setQuery] = useState('');

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      dispatch(setOpenModal(null));
      setQuery('');
    }
  };

  const fields = useQueryFiltersDefinitions();
  const luceneFields = useMemo(() => {
    return Object.entries(fields).map(([key, filter]) => ({
      key: key,
      label: filter.label,
      category: filter.category,
    }));
  }, [fields]);

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    dispatch(
      addQueryFilter({
        key: 'es_filter',
        value: trimmed,
      }),
    );
    dispatch(setOpenModal(null));
    setQuery('');
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <VisuallyHidden>
        <DialogTitle>Add Custom ES Filter</DialogTitle>
      </VisuallyHidden>
      <DialogContent
        aria-describedby={undefined}
        className="gap-1 p-1"
      >
        <LuceneEditor
          value={query}
          onChange={setQuery}
          placeholder="e.g. alert.severity:1 AND src_ip:192.168.*"
          onSubmit={handleSubmit}
          fields={luceneFields}
          autoFocus
        />
        <Row className="items-center justify-end">
          <Row className="items-center gap-4 text-xs">
            <Row className="items-center gap-1">
              <pre className="text-muted-foreground">Shift+Enter</pre>{' '}
              <p>to add a new line</p>
            </Row>
            <Row className="items-center gap-1">
              <pre className="text-muted-foreground">Enter</pre>{' '}
              <p>to submit</p>
            </Row>
          </Row>
        </Row>
      </DialogContent>
    </Dialog>
  );
};
