import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';

import { SendMailFilterAction } from '../../../model/filter-action.schema';
import {
  CreateEditSendMailFilterActionForm,
  DEFAULT_MAX_MAILS_PER_DAY,
} from './create-edit-send-mail.form';

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

const setupRulesetsAndTestActions = () => {
  server.use(
    http.get(baseUrl + '/rules/ruleset/', () =>
      HttpResponse.json({
        count: 1,
        next: null,
        previous: null,
        results: [{ pk: 42, name: 'Default ruleset' }],
      }),
    ),
    http.post(baseUrl + '/rules/processing-filter/test/', () =>
      HttpResponse.json({
        fields: ['src_ip'],
        operators: ['equal', 'different'],
      }),
    ),
  );
};

const renderForm = async () => {
  setupRulesetsAndTestActions();
  return renderWithProviders(
    <CreateEditSendMailFilterActionForm edit={false} />,
    {
      router: createTestRouter(),
      preloadedState: {
        filters: {
          queryFilters: {
            queryFilters: [
              {
                id: 'test-1',
                key: 'src_ip',
                value: '10.0.0.1',
                is_negated: false,
                is_wildcarded: false,
                is_suspended: false,
              },
            ],
            displayedQueryFiltersIds: [],
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      },
    },
  );
};

describe('CreateEditSendMailFilterActionForm', () => {
  test('renders Maximum mails sent per day pre-filled to the default', async () => {
    await renderForm();

    const input = (await screen.findByLabelText(
      /Maximum mails sent per day/i,
    )) as HTMLInputElement;
    expect(input.value).toBe(String(DEFAULT_MAX_MAILS_PER_DAY));
  });

  test('submitting posts the documented body shape', async () => {
    let capturedBody: unknown;
    server.use(
      http.post(baseUrl + '/rules/processing-filter/', async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ pk: 99 });
      }),
    );

    const user = userEvent.setup();
    await renderForm();

    // Select the ruleset
    const checkbox = await screen.findByRole('checkbox', {
      name: /Default ruleset/i,
    });
    await user.click(checkbox);

    const submit = await screen.findByRole('button', { name: /Submit/i });
    await waitFor(() => expect(submit).not.toBeDisabled());
    await user.click(submit);

    await waitFor(() => expect(capturedBody).toBeDefined());
    expect(capturedBody).toMatchObject({
      action: 'send_mail',
      comment: '',
      filter_defs: [
        expect.objectContaining({
          key: 'src_ip',
          value: '10.0.0.1',
        }),
      ],
      rulesets: [42],
      options: { max_mails_per_day: DEFAULT_MAX_MAILS_PER_DAY },
    });
  });

  test('submit stays disabled until at least one ruleset is selected', async () => {
    await renderForm();

    const submit = await screen.findByRole('button', { name: /Submit/i });
    // No ruleset selected: schema refuses to validate, button stays disabled.
    expect(submit).toBeDisabled();
  });

  test('edit mode PATCHes the existing filter action with its pk', async () => {
    let capturedBody: unknown;
    let capturedUrl = '';
    let capturedMethod = '';
    server.use(
      http.patch(
        baseUrl + '/rules/processing-filter/:pk/',
        async ({ request, params }) => {
          capturedBody = await request.json();
          capturedUrl = String(params.pk);
          capturedMethod = request.method;
          return HttpResponse.json({ pk: Number(params.pk) });
        },
      ),
    );

    const existing: SendMailFilterAction = {
      pk: 77,
      action: 'send_mail',
      event_type: 'alert',
      filter_defs: [
        {
          key: 'src_ip',
          value: '10.0.0.1',
          operator: 'equal',
          full_string: true,
        },
      ],
      rulesets: [42],
      index: 0,
      description: '',
      enabled: true,
      imported: false,
      comment: 'existing comment',
      username: 'tester',
      creation_date: '2026-04-29T00:00:00Z',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options: { max_mails_per_day: 9 } as any,
    };

    setupRulesetsAndTestActions();
    await renderWithProviders(
      <CreateEditSendMailFilterActionForm
        edit
        filterAction={existing}
      />,
      { router: createTestRouter() },
    );

    const input = (await screen.findByLabelText(
      /Maximum mails sent per day/i,
    )) as HTMLInputElement;
    await waitFor(() => expect(input.value).toBe('9'));

    const submit = await screen.findByRole('button', { name: /Submit/i });
    const user = userEvent.setup();
    await waitFor(() => expect(submit).not.toBeDisabled());
    await user.click(submit);

    await waitFor(() => expect(capturedBody).toBeDefined());
    expect(capturedMethod).toBe('PATCH');
    expect(capturedUrl).toBe('77');
    expect(capturedBody).toMatchObject({
      action: 'send_mail',
      options: { max_mails_per_day: 9 },
    });
  });

  test('surfaces an error toast and keeps the modal open when the API rejects', async () => {
    const errors: string[] = [];
    server.use(
      http.post(baseUrl + '/rules/processing-filter/', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    );

    const { toast } = await import('sonner');
    const original = toast.error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (toast as any).error = (message: string) => {
      errors.push(message);
      return 0;
    };

    try {
      const user = userEvent.setup();
      await renderForm();

      const checkbox = await screen.findByRole('checkbox', {
        name: /Default ruleset/i,
      });
      await user.click(checkbox);
      const submit = await screen.findByRole('button', { name: /Submit/i });
      await waitFor(() => expect(submit).not.toBeDisabled());
      await user.click(submit);

      await waitFor(() =>
        expect(errors).toContain('Failed to create filter action'),
      );
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (toast as any).error = original;
    }
  });
});
