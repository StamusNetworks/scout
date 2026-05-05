import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { mockNavigate } from '@/common/testing/mocks/hooks/use-navigate.mock';
import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

import { KillChainCountersData } from '../../model/kill-chain';
import {
  KillChainCounters,
  KillChainCountersByFamilyId,
  KillChainCountersByThreatId,
} from './kill-chain-counters';
import { KillChainCountersTemplate } from './kill-chain-counters.template';

afterEach(() => {
  vi.clearAllMocks();
});

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/appliances/threat_family/kill_chain_family/', () => {
      return HttpResponse.json(mockKillChainWireData);
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
    await renderWithProviders(<KillChainCounters />, {
      router: createTestRouter(),
    });

    expect(screen.getAllByTestId('spin')).toHaveLength(7);

    const reconItem = await screen.findByText('10');
    await userEvent.click(reconItem);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/threats/compromises/entities?killchain=reconnaissance',
    });
  });

  test('clicking on a KillChainCountersByThreatId item dispatches two filters and navigates', async () => {
    await renderWithProviders(<KillChainCountersByThreatId threatId="123" />, {
      router: createTestRouter(),
    });

    const reconItem = await screen.findByText('8');
    await userEvent.click(reconItem);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/threats/coverage/threat/123?killchain=reconnaissance',
    });
  });

  test('clicking on a KillChainCountersByFamilyId item dispatches two filters and navigates', async () => {
    await renderWithProviders(<KillChainCountersByFamilyId familyId="1" />, {
      router: createTestRouter(),
    });

    const reconItem = await screen.findByText('10');
    await userEvent.click(reconItem);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/threats/coverage/family/1?killchain=reconnaissance',
    });
  });
});

const mockKillChainData: KillChainCountersData = {
  reconnaissance: 10,
  weaponization: 5,
  delivery: 3,
  exploitation: 2,
  installation: 1,
  command_and_control: 7,
  actions_on_objectives: 4,
};

// Wire-shape used by MSW handlers — server returns array, ACL maps it to
// the Record-shaped domain type at the boundary.
const mockKillChainWireData = [
  { kill_chain: 'reconnaissance', nb_assets: 10 },
  { kill_chain: 'weaponization', nb_assets: 5 },
  { kill_chain: 'delivery', nb_assets: 3 },
  { kill_chain: 'exploitation', nb_assets: 2 },
  { kill_chain: 'installation', nb_assets: 1 },
  { kill_chain: 'command_and_control', nb_assets: 7 },
  { kill_chain: 'actions_on_objectives', nb_assets: 4 },
];
