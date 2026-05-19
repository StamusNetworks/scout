import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RunBanner } from './run-banner';

describe('RunBanner', () => {
  it('renders the run-count summary line', () => {
    render(
      <RunBanner
        total={36}
        withResults={5}
        docsUrl="https://example.test/docs"
      />,
    );
    expect(
      screen.getByText(/36 queries ran · 5 returned results/),
    ).toBeInTheDocument();
  });

  it('uses the surface-specific total (41 for host)', () => {
    render(
      <RunBanner
        total={41}
        withResults={8}
        docsUrl="https://example.test/docs"
      />,
    );
    expect(
      screen.getByText(/41 queries ran · 8 returned results/),
    ).toBeInTheDocument();
  });

  it('renders zero-result counts without suppressing the banner', () => {
    render(
      <RunBanner
        total={36}
        withResults={0}
        docsUrl="https://example.test/docs"
      />,
    );
    expect(
      screen.getByText(/36 queries ran · 0 returned results/),
    ).toBeInTheDocument();
  });

  it('renders a Learn more link that opens in a new tab', () => {
    render(
      <RunBanner
        total={36}
        withResults={5}
        docsUrl="https://example.test/docs"
      />,
    );
    const link = screen.getByRole('link', { name: /learn more/i });
    expect(link).toHaveAttribute('href', 'https://example.test/docs');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
