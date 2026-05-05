import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

import { Button } from '@/common/design-system/atoms/ui/button';
import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';

import { FilterActionsDropdown } from './filter-actions-dropdown';

const SMTP_TOOLTIP =
  'You need to configure the SMTP and enable the Output plugin in the Global Appliance Settings';
const NO_DATA_TOOLTIP = 'You need a valid Filter Set to create a filter action';
const LOADING_TOOLTIP = 'Available actions are loading';

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

const mockTestActions = (actions: string[]) => {
  server.use(
    http.post(baseUrl + '/rules/processing-filter/test_actions/', () =>
      HttpResponse.json({
        actions: actions.length === 0 ? [] : actions.map((a) => [a]),
      }),
    ),
  );
};

const renderDropdown = async () =>
  renderWithProviders(
    <FilterActionsDropdown
      trigger={() => (
        <Button
          type="button"
          data-testid="dropdown-trigger"
        >
          Open
        </Button>
      )}
    />,
    { router: createTestRouter() },
  );

describe('FilterActionsDropdown', () => {
  test('the trigger is never disabled, even when no actions are available', async () => {
    mockTestActions([]);
    await renderDropdown();
    const trigger = await screen.findByTestId('dropdown-trigger');

    await waitFor(() => expect(trigger).not.toBeDisabled());
  });

  test('all menu items are disabled and show the generic tooltip when no actions returned', async () => {
    mockTestActions([]);
    const user = userEvent.setup();
    await renderDropdown();

    const trigger = await screen.findByTestId('dropdown-trigger');
    await user.click(trigger);

    await waitFor(() => {
      const sendMail = screen.getByRole('menuitem', { name: /Send mail/i });
      expect(sendMail).toHaveAttribute('data-disabled');
    });

    const sendMail = screen.getByRole('menuitem', { name: /Send mail/i });
    await user.hover(sendMail);
    await waitFor(() =>
      expect(screen.getAllByText(NO_DATA_TOOLTIP).length).toBeGreaterThan(0),
    );
  });

  test('all menu items expose the loading tooltip while the test_actions request is in flight', async () => {
    let resolveResponse: ((value: Response) => void) | undefined;
    server.use(
      http.post(
        baseUrl + '/rules/processing-filter/test_actions/',
        () =>
          new Promise<Response>((resolve) => {
            resolveResponse = resolve;
          }),
      ),
    );
    const user = userEvent.setup();
    await renderDropdown();

    const trigger = await screen.findByTestId('dropdown-trigger');
    await user.click(trigger);

    const sendMail = await screen.findByRole('menuitem', {
      name: /Send mail/i,
    });
    expect(sendMail).toHaveAttribute('data-disabled');
    expect(sendMail).toHaveAttribute('aria-description', LOADING_TOOLTIP);

    resolveResponse?.(HttpResponse.json({ actions: [['send_mail']] }));
  });

  test('disabled items expose their tooltip via aria-description', async () => {
    mockTestActions(['threshold', 'suppress', 'tag', 'tagkeep', 'threat']);
    const user = userEvent.setup();
    await renderDropdown();

    const trigger = await screen.findByTestId('dropdown-trigger');
    await user.click(trigger);

    await waitFor(() => {
      const sendMail = screen.getByRole('menuitem', { name: /Send mail/i });
      expect(sendMail).toHaveAttribute('aria-description', SMTP_TOOLTIP);
    });
  });

  test('Send mail entry sits below Create declaration events', async () => {
    mockTestActions([
      'threshold',
      'suppress',
      'tag',
      'tagkeep',
      'threat',
      'send_mail',
    ]);
    const user = userEvent.setup();
    await renderDropdown();

    const trigger = await screen.findByTestId('dropdown-trigger');
    await user.click(trigger);

    const items = await screen.findAllByRole('menuitem');
    const labels = items.map((i) => i.textContent);
    const declarationIdx = labels.findIndex((l) =>
      l?.includes('Create declaration events'),
    );
    const sendMailIdx = labels.findIndex((l) => l?.includes('Send mail'));

    expect(declarationIdx).toBeGreaterThanOrEqual(0);
    expect(sendMailIdx).toBeGreaterThan(declarationIdx);
  });

  test('Send mail is disabled with the SMTP tooltip when send_mail is missing from a populated list', async () => {
    mockTestActions(['threshold', 'suppress', 'tag', 'tagkeep', 'threat']);
    const user = userEvent.setup();
    await renderDropdown();

    const trigger = await screen.findByTestId('dropdown-trigger');
    await user.click(trigger);

    await waitFor(() => {
      const sendMail = screen.getByRole('menuitem', { name: /Send mail/i });
      expect(sendMail).toHaveAttribute('data-disabled');
    });

    const sendMail = screen.getByRole('menuitem', { name: /Send mail/i });
    await user.hover(sendMail);
    await waitFor(() =>
      expect(screen.getAllByText(SMTP_TOOLTIP).length).toBeGreaterThan(0),
    );
  });

  test('Send mail is enabled and dispatches openSendMailModal when send_mail is in the list', async () => {
    mockTestActions(['send_mail']);
    const user = userEvent.setup();
    const { store } = await renderDropdown();

    const trigger = await screen.findByTestId('dropdown-trigger');
    await user.click(trigger);

    await waitFor(() => {
      const sendMail = screen.getByRole('menuitem', { name: /Send mail/i });
      expect(sendMail).not.toHaveAttribute('data-disabled');
    });

    const sendMail = screen.getByRole('menuitem', { name: /Send mail/i });
    await user.click(sendMail);

    const modalState = store.getState().modals.filterActionModal;
    expect(modalState.kind).toBe('sendMail');
    if (modalState.kind === 'sendMail') {
      expect(modalState.mode).toBe('create');
    }
  });
});
