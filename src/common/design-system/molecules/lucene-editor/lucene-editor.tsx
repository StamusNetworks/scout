import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { Compartment, EditorState } from '@codemirror/state';
import {
  EditorView,
  keymap,
  placeholder as cmPlaceholder,
} from '@codemirror/view';
import { useEffect, useRef } from 'react';

import { cn } from '@/common/lib/utils';

import { luceneAutocomplete } from './codemirror/lucene-autocomplete';
import { luceneKeymap } from './codemirror/lucene-keymap';
import { luceneLanguage } from './codemirror/lucene-language';
import { luceneLinter } from './codemirror/lucene-linter';
import {
  luceneEditorTheme,
  luceneHighlighting,
} from './codemirror/lucene-theme';
import type { LuceneEditorProps } from './lucene-editor.types';

const DEFAULT_MIN_LINES = 3;
const DEFAULT_MAX_LINES = 10;
const LINE_HEIGHT = 20;

export function LuceneEditor({
  value,
  onChange,
  fields,
  onRequestValues,
  placeholder,
  className,
  disabled = false,
  minLines = DEFAULT_MIN_LINES,
  maxLines = DEFAULT_MAX_LINES,
  onSubmit,
  onLintResults,
  autoFocus = false,
}: LuceneEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const readOnlyCompartment = useRef(new Compartment());
  const fieldsCompartment = useRef(new Compartment());
  const placeholderCompartment = useRef(new Compartment());

  // Refs for latest callback values (avoids recreating extensions)
  const onChangeRef = useRef(onChange);
  const onSubmitRef = useRef(onSubmit);
  const onLintResultsRef = useRef(onLintResults);
  const fieldsRef = useRef(fields);
  const onRequestValuesRef = useRef(onRequestValues);
  onChangeRef.current = onChange;
  onSubmitRef.current = onSubmit;
  onLintResultsRef.current = onLintResults;
  fieldsRef.current = fields;
  onRequestValuesRef.current = onRequestValues;

  // Mount editor
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        luceneLanguage(),
        luceneEditorTheme,
        luceneHighlighting,
        updateListener,
        luceneLinter((diags) => onLintResultsRef.current?.(diags)),
        fieldsCompartment.current.of(
          luceneAutocomplete(
            () => fieldsRef.current ?? [],
            (...args) =>
              onRequestValuesRef.current?.(...args) ?? Promise.resolve([]),
          ),
        ),
        keymap.of([
          ...luceneKeymap(() => onSubmitRef.current),
          ...defaultKeymap,
          ...historyKeymap,
        ]),
        history(),
        readOnlyCompartment.current.of(EditorState.readOnly.of(disabled)),
        placeholderCompartment.current.of(
          placeholder ? cmPlaceholder(placeholder) : [],
        ),
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({
          'aria-label': placeholder ?? 'Lucene query editor',
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    if (autoFocus) {
      requestAnimationFrame(() => view.focus());
    }

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only run on mount — all dynamic updates handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync value prop → editor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  // Sync disabled prop
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: readOnlyCompartment.current.reconfigure(
        EditorState.readOnly.of(disabled),
      ),
    });
  }, [disabled]);

  // Sync placeholder prop
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: placeholderCompartment.current.reconfigure(
        placeholder ? cmPlaceholder(placeholder) : [],
      ),
    });
  }, [placeholder]);

  // Sync fields (reconfigure autocomplete compartment)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: fieldsCompartment.current.reconfigure(
        luceneAutocomplete(
          () => fieldsRef.current ?? [],
          (...args) =>
            onRequestValuesRef.current?.(...args) ?? Promise.resolve([]),
        ),
      ),
    });
  }, [fields]);

  const minHeight = minLines * LINE_HEIGHT;
  const maxHeight = maxLines * LINE_HEIGHT;

  return (
    <div
      ref={containerRef}
      className={cn(
        '[&:has(.cm-focused)]:border-ring [&:has(.cm-focused)]:ring-ring/50 outline-0 [&:has(.cm-focused)]:ring-[3px]',
        'border-input rounded-md border bg-transparent text-sm shadow-xs',
        '[&_.cm-scroller]:overflow-auto',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      style={
        {
          '--cm-min-height': `${minHeight}px`,
          '--cm-max-height': `${maxHeight}px`,
        } as React.CSSProperties
      }
    />
  );
}
