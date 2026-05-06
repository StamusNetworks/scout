import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/common/testing/test-utils';

import { InteractiveLegendContent } from './cipher-security';

const config = {
  recommended: { label: 'Recommended', color: 'var(--chart-1)' },
  insecure: { label: 'Insecure', color: 'var(--color-red-500)' },
  degraded: { label: 'Degraded', color: 'var(--color-yellow-500)' },
};

describe('InteractiveLegendContent', () => {
  it('renders all legend items from the config', async () => {
    await renderWithProviders(
      <InteractiveLegendContent
        config={config}
        hiddenSeries={new Set()}
        onToggle={() => {}}
      />,
    );

    expect(screen.getByText('Recommended')).toBeInTheDocument();
    expect(screen.getByText('Insecure')).toBeInTheDocument();
    expect(screen.getByText('Degraded')).toBeInTheDocument();
  });

  it('calls onToggle with the correct dataKey when an item is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    await renderWithProviders(
      <InteractiveLegendContent
        config={config}
        hiddenSeries={new Set()}
        onToggle={onToggle}
      />,
    );

    await user.click(screen.getByText('Insecure'));
    expect(onToggle).toHaveBeenCalledWith('insecure');

    await user.click(screen.getByText('Recommended'));
    expect(onToggle).toHaveBeenCalledWith('recommended');
  });

  it('applies opacity-40 class to hidden items', async () => {
    await renderWithProviders(
      <InteractiveLegendContent
        config={config}
        hiddenSeries={new Set(['insecure'])}
        onToggle={() => {}}
      />,
    );

    const insecureButton = screen.getByText('Insecure').closest('button');
    expect(insecureButton).toHaveClass('opacity-40');
  });

  it('does not apply opacity-40 class to visible items', async () => {
    await renderWithProviders(
      <InteractiveLegendContent
        config={config}
        hiddenSeries={new Set(['insecure'])}
        onToggle={() => {}}
      />,
    );

    const recommendedButton = screen.getByText('Recommended').closest('button');
    const degradedButton = screen.getByText('Degraded').closest('button');

    expect(recommendedButton).not.toHaveClass('opacity-40');
    expect(degradedButton).not.toHaveClass('opacity-40');
  });

  it('always renders all items even when some are hidden', async () => {
    await renderWithProviders(
      <InteractiveLegendContent
        config={config}
        hiddenSeries={new Set(['insecure', 'degraded'])}
        onToggle={() => {}}
      />,
    );

    expect(screen.getByText('Recommended')).toBeInTheDocument();
    expect(screen.getByText('Insecure')).toBeInTheDocument();
    expect(screen.getByText('Degraded')).toBeInTheDocument();
  });
});
