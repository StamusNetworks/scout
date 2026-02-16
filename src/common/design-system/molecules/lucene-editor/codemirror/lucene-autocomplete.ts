import {
  autocompletion,
  type CompletionContext,
  type CompletionResult,
} from '@codemirror/autocomplete';
import type { Extension } from '@codemirror/state';

import type { LuceneFieldDefinition } from '../lucene-editor.types';

const OPERATOR_COMPLETIONS = [
  { label: 'AND', type: 'keyword', detail: 'Boolean AND' },
  { label: 'OR', type: 'keyword', detail: 'Boolean OR' },
  { label: 'NOT', type: 'keyword', detail: 'Boolean NOT' },
];

export function luceneAutocomplete(
  getFields: () => LuceneFieldDefinition[],
  onRequestValues?: (
    field: string,
  ) => Promise<{ label: string; detail?: string }[]>,
): Extension {
  return autocompletion({
    override: [
      (
        context: CompletionContext,
      ): CompletionResult | Promise<CompletionResult | null> | null => {
        return completeLucene(context, getFields, onRequestValues);
      },
    ],
    icons: false,
  });
}

function completeLucene(
  context: CompletionContext,
  getFields: () => LuceneFieldDefinition[],
  onRequestValues?: (
    field: string,
  ) => Promise<{ label: string; detail?: string }[]>,
): CompletionResult | Promise<CompletionResult | null> | null {
  const { state, pos } = context;
  const line = state.doc.lineAt(pos);
  const textBefore = line.text.slice(0, pos - line.from);

  // After "fieldname:" — offer field values
  const fieldValueMatch = textBefore.match(/(\S+):([^\s"]*)?$/);
  if (fieldValueMatch && onRequestValues) {
    const fieldName = fieldValueMatch[1];
    const valuePrefix = fieldValueMatch[2] ?? '';
    const from = pos - valuePrefix.length;

    return onRequestValues(fieldName).then((values) => {
      if (!values.length) return null;
      return {
        from,
        options: values.map((v) => ({
          label: v.label,
          detail: v.detail,
          type: 'text',
        })),
        validFor: /^[^\s"]*$/,
      };
    });
  }

  // Mid-word: match field names and operators
  const wordMatch = textBefore.match(/(\w[\w.]*)$/);
  if (wordMatch) {
    const prefix = wordMatch[1];
    const from = pos - prefix.length;
    const fields = getFields();

    const fieldCompletions = fields.map((f) => ({
      label: f.key,
      detail: f.label ?? f.category,
      type: 'property' as const,
      apply: f.key + ':',
      boost: 1,
    }));

    const options = [...fieldCompletions, ...OPERATOR_COMPLETIONS];

    return {
      from,
      options,
      validFor: /^[\w.]*$/,
    };
  }

  // After whitespace or "(" — offer fields + operators (explicit activation only)
  if (!context.explicit) return null;

  const fields = getFields();
  const fieldCompletions = fields.map((f) => ({
    label: f.key,
    detail: f.label ?? f.category,
    type: 'property' as const,
    apply: f.key + ':',
    boost: 1,
  }));

  return {
    from: pos,
    options: [...fieldCompletions, ...OPERATOR_COMPLETIONS],
  };
}
