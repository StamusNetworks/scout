import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

import { JsonView } from './json-view';

describe('JsonView', () => {
  it('renders the wrapped @microlink/react-json-view component', async () => {
    const { container } = await renderWithProviders(
      <JsonView data={{ hello: 'world' }} />,
      { preloadedState: { ...initialState } },
    );

    expect(container.querySelector('.react-json-view')).not.toBeNull();
  });
});
