import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';

export const luceneEditorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    fontSize: '14px',
    outline: 'none',
    minHeight: 'var(--cm-min-height)',
    maxHeight: 'var(--cm-max-height)',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-content': {
    caretColor: 'var(--foreground)',
    fontFamily: 'inherit',
    padding: '8px 0',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--foreground)',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'var(--accent)',
  },
  '.cm-activeLine': {
    backgroundColor: 'transparent',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: 'var(--muted-foreground)',
    border: 'none',
    paddingLeft: '4px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
  },
  '.cm-placeholder': {
    color: 'var(--muted-foreground)',
    fontStyle: 'italic',
  },
  // Lint gutter
  '.cm-lint-marker-error': {
    content: '"!"',
    color: 'var(--destructive)',
  },
  '.cm-lint-marker-warning': {
    content: '"!"',
    color: 'var(--chart-5)',
  },
  // Lint tooltip
  '.cm-tooltip': {
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
  '.cm-tooltip-autocomplete': {
    '& > ul': {
      fontFamily: 'inherit',
    },
    '& > ul > li': {
      padding: '4px 8px',
    },
    '& > ul > li[aria-selected]': {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)',
    },
  },
  '.cm-tooltip-lint': {
    padding: '4px 8px',
  },
  '.cm-diagnosticText': {
    fontSize: '13px',
  },
  // Scrollbar styling
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'inherit',
  },
});

const luceneHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: 'var(--syntax-3)' },
  { tag: tags.propertyName, color: 'var(--syntax-1)' },
  { tag: tags.string, color: 'var(--syntax-2)' },
  {
    tag: tags.special(tags.string),
    color: 'var(--syntax-2)',
    fontWeight: '600',
  },
  { tag: tags.number, color: 'var(--syntax-4)' },
  { tag: tags.bracket, color: 'var(--syntax-5)' },
  { tag: tags.paren, color: 'var(--syntax-5)' },
  { tag: tags.regexp, color: 'var(--syntax-5)', fontStyle: 'italic' },
  { tag: tags.name, color: 'var(--foreground)' },
]);

export const luceneHighlighting = syntaxHighlighting(luceneHighlightStyle);
