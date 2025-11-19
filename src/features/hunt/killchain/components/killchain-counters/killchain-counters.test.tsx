import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';

import { mockNavigate } from '@/common/testing/mocks/hooks/use-navigate.mock';
import { baseUrl, server } from '@/common/testing/mocks/server';
import {
  expectFiltersWithoutId,
  renderWithProviders,
} from '@/common/testing/test-utils';

import { KillChainPhase } from '../../killchain';
import {
  KillChainCounters,
  KillChainCountersByFamilyId,
  KillChainCountersByThreatId,
} from './killchain-counters';
import { KillChainCountersTemplate } from './killchain-counters.template';

afterEach(() => {
  vi.clearAllMocks();
});

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/appliances/threat_family/kill_chain_family/', () => {
      return HttpResponse.json(mockKillChainData);
    }),
    http.get(baseUrl + '/rules/es/mapping/', () => {
      return HttpResponse.json({
        'stamus.kill_chain': {
          type: 'text',
        },
      });
    }),
    http.get(baseUrl + '/appliances/threat/:threatId/kill_chain/', () => {
      return HttpResponse.json({
        reconnaissance: 8,
        weaponization: 6,
        delivery: 4,
        exploitation: 2,
        installation: 1,
        command_and_control: 5,
        actions_on_objectives: 3,
      });
    }),
  );
});

describe('KillChainCounters', () => {
  test('should render KillChainCountersTemplate component', async () => {
    const onClick = vi.fn();
    renderWithProviders(
      <KillChainCountersTemplate
        data={mockKillChainData}
        onKCClick={onClick}
        isLoading={false}
      />,
    );
    // Wait for the data to load
    // Check that onClick is called
    await userEvent.click(screen.getByText('10'));
    await userEvent.click(screen.getByText('5'));
    await userEvent.click(screen.getByText('3'));
    await userEvent.click(screen.getByText('2'));
    await userEvent.click(screen.getByText('1'));
    await userEvent.click(screen.getByText('7'));
    await userEvent.click(screen.getByText('4'));
    expect(onClick).toHaveBeenCalledTimes(7);
    // Check that all phase titles are rendered
    expect(screen.getByText('Reconnaissance')).toBeInTheDocument();
    expect(screen.getByText('Weaponization')).toBeInTheDocument();
    expect(screen.getByText('Delivery')).toBeInTheDocument();
    expect(screen.getByText('Exploitation')).toBeInTheDocument();
    expect(screen.getByText('Installation')).toBeInTheDocument();
    expect(screen.getByText('Command and Control')).toBeInTheDocument();
    expect(screen.getByText('Actions on Objectives')).toBeInTheDocument();
  });

  test('clicking on a KillChainCounters item dispatches filter and navigates', async () => {
    const { store } = renderWithProviders(
      <MemoryRouter>
        <KillChainCounters />
      </MemoryRouter>,
    );

    expect(screen.getAllByTestId('spin')).toHaveLength(7);

    const reconItem = await screen.findByText('10');
    await userEvent.click(reconItem);

    expectFiltersWithoutId(store).toEqual([
      {
        key: 'stamus.kill_chain',
        value: 'reconnaissance',
        is_negated: false,
        is_suspended: false,
        is_wildcarded: false,
      },
    ]);
    expect(mockNavigate).toHaveBeenCalledWith('/explorer');
  });

  test('clicking on a KillChainCountersByThreatId item dispatches two filters and navigates', async () => {
    const { store } = renderWithProviders(
      <MemoryRouter>
        <KillChainCountersByThreatId threatId="123" />
      </MemoryRouter>,
    );

    const reconItem = await screen.findByText('8');
    await userEvent.click(reconItem);

    expect(mockNavigate).toHaveBeenCalledWith('/explorer');
    expect(store.getState().filters.queryFilters.queryFilters).toHaveLength(2);
  });

  test('clicking on a KillChainCountersByFamilyId item dispatches two filters and navigates', async () => {
    const { store } = renderWithProviders(
      <MemoryRouter>
        <KillChainCountersByFamilyId familyId="1" />
      </MemoryRouter>,
    );

    const reconItem = await screen.findByText('10');
    await userEvent.click(reconItem);

    expect(mockNavigate).toHaveBeenCalledWith('/explorer');
    expectFiltersWithoutId(store).toEqual([
      {
        key: 'stamus.kill_chain',
        value: 'reconnaissance',
        is_negated: false,
        is_suspended: false,
        is_wildcarded: false,
      },
      {
        key: 'stamus.family_name',
        value: 'Test Family',
        is_negated: false,
        is_suspended: false,
        is_wildcarded: false,
      },
    ]);
  });
});

const mockKillChainData: { kill_chain: KillChainPhase; nb_assets: number }[] = [
  { kill_chain: 'reconnaissance', nb_assets: 10 },
  { kill_chain: 'weaponization', nb_assets: 5 },
  { kill_chain: 'delivery', nb_assets: 3 },
  { kill_chain: 'exploitation', nb_assets: 2 },
  { kill_chain: 'installation', nb_assets: 1 },
  { kill_chain: 'command_and_control', nb_assets: 7 },
  { kill_chain: 'actions_on_objectives', nb_assets: 4 },
];
