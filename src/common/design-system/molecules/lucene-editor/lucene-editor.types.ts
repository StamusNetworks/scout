import type { Diagnostic } from '@codemirror/lint';

export interface LuceneFieldDefinition {
  key: string;
  label?: string;
  category?: string;
}

export interface LuceneEditorProps {
  value: string;
  onChange: (value: string) => void;
  fields?: LuceneFieldDefinition[];
  onRequestValues?: (
    field: string,
  ) => Promise<{ label: string; detail?: string }[]>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minLines?: number;
  maxLines?: number;
  onSubmit?: (value: string) => void;
  onLintResults?: (diagnostics: Diagnostic[]) => void;
  autoFocus?: boolean;
}
