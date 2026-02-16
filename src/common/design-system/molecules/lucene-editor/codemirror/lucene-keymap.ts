import type { KeyBinding } from '@codemirror/view';

export function luceneKeymap(
  getOnSubmit: () => ((value: string) => void) | undefined,
): KeyBinding[] {
  return [
    {
      key: 'Enter',
      run: (view) => {
        const onSubmit = getOnSubmit();
        if (!onSubmit) return false;
        onSubmit(view.state.doc.toString());
        return true;
      },
    },
    {
      key: 'Shift-Enter',
      run: (view) => {
        view.dispatch(view.state.replaceSelection('\n'));
        return true;
      },
    },
    {
      key: 'Mod-Enter',
      run: (view) => {
        const onSubmit = getOnSubmit();
        if (!onSubmit) return false;
        onSubmit(view.state.doc.toString());
        return true;
      },
    },
  ];
}
