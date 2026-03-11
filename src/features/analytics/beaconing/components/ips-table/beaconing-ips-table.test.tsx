import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { DeepPartial } from 'react-hook-form';
import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { vi } from 'vitest';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { routeTree } from '@/routeTree.gen';

const createTestRouter = () =>
  createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
import { Host } from '@/features/analytics/hosts/model/host';
import { Entity } from '@/features/hunt/entities/model/entity';
import { Threat } from '@/features/hunt/threats/model/threat.model';

import { BeaconingIPsTable } from './beaconing-ips-table';

// Mock host data for testing
const mockHostsData: DeepPartial<Host>[] = [
  {
    ip: '192.168.1.1',
    host_id: {
      hostname: [
        {
          host: 'host1.example.com',
          first_seen: '2023-01-01T00:00:00Z',
          last_seen: '2023-01-02T00:00:00Z',
        },
      ],
      net_info: [
        {
          agg: '192.168.1.0/24',
          first_seen: '2023-01-01T00:00:00Z',
          last_seen: '2023-01-02T00:00:00Z',
        },
      ],
      username: [
        {
          user: 'admin',
          first_seen: '2023-01-01T00:00:00Z',
          last_seen: '2023-01-02T00:00:00Z',
        },
      ],
      roles: [
        {
          name: 'domain controller',
          first_seen: '2023-01-01T00:00:00Z',
          last_seen: '2023-01-02T00:00:00Z',
        },
      ],
      first_seen: '2023-01-01T00:00:00Z',
      last_seen: '2023-01-02T00:00:00Z',
      tenant: 1,
    },
    hits: 10,
  },
  {
    ip: '192.168.1.2',
    host_id: {
      hostname: [
        {
          host: 'host2.example.com',
          first_seen: '2023-01-01T00:00:00Z',
          last_seen: '2023-01-02T00:00:00Z',
        },
      ],
      net_info: [
        {
          agg: '192.168.1.0/24',
          first_seen: '2023-01-01T00:00:00Z',
          last_seen: '2023-01-02T00:00:00Z',
        },
      ],
      username: [
        {
          user: 'user1',
          first_seen: '2023-01-01T00:00:00Z',
          last_seen: '2023-01-02T00:00:00Z',
        },
      ],
      roles: [
        {
          name: 'printer',
          first_seen: '2023-01-01T00:00:00Z',
          last_seen: '2023-01-02T00:00:00Z',
        },
      ],
      first_seen: '2023-01-01T00:00:00Z',
      last_seen: '2023-01-02T00:00:00Z',
      tenant: 1,
    },
    hits: 5,
  },
];

// Mock assets with threats data for AssetThreatTagsList
const mockAsset1ThreatsData: Partial<Entity>[] = [
  {
    pk: 1,
    value: '192.168.1.1',
    asset_type: 'ip',
    threats: [
      {
        threat__threat_id: 101,
        threat__name: 'Threat 101',
        threat__family__family_id: 1,
        status: 'new',
        kill_chain: 1,
        kill_chain_offender: 1,
        first_seen: '2023-01-01T00:00:00Z',
        last_seen: '2023-01-02T00:00:00Z',
      },
      {
        threat__threat_id: 102,
        threat__name: 'Threat 102',
        threat__family__family_id: 2,
        status: 'new',
        kill_chain: 2,
        kill_chain_offender: 0,
        first_seen: '2023-01-01T00:00:00Z',
        last_seen: '2023-01-02T00:00:00Z',
      },
    ],
  },
];

const mockAsset2ThreatsData: Partial<Entity>[] = [
  {
    pk: 2,
    value: '192.168.1.2',
    asset_type: 'ip',
    threats: [
      {
        threat__threat_id: 103,
        threat__name: 'Threat 103',
        threat__family__family_id: 3,
        status: 'fixed',
        kill_chain: 3,
        kill_chain_offender: 0,
        first_seen: '2023-01-01T00:00:00Z',
        last_seen: '2023-01-02T00:00:00Z',
      },
    ],
  },
];

// Mock threat details for ThreatTag component
const mockThreatDetails: Partial<Threat>[] = [
  {
    pk: 101,
    name: 'Threat 101',
    threat_id: 101,
    family: 1,
    description: 'This is a test threat 101',
    family_class: 'doc',
  },
  {
    pk: 102,
    name: 'Threat 102',
    threat_id: 102,
    family: 2,
    description: 'This is a test threat 102',
    family_class: 'doc',
  },
  {
    pk: 103,
    name: 'Threat 103',
    threat_id: 103,
    family: 3,
    description: 'This is a test threat 103',
    family_class: 'dopv',
  },
];

afterEach(() => {
  vi.clearAllMocks();
});

describe('BeaconingAssetsTable', () => {
  beforeEach(() => {
    // Set up mock responses for the various API endpoints
    server.use(
      // Mock the hosts API response
      http.get(baseUrl + '/appliances/host_id/', ({ request }) => {
        const url = new URL(request.url);
        const hostFilter = url.searchParams.get('host_id_qfilter') || '';

        // Return different data based on the IP filter
        if (
          hostFilter.includes('ip:192.168.1.1') &&
          hostFilter.includes('ip:192.168.1.2')
        ) {
          return HttpResponse.json({
            count: mockHostsData.length,
            next: null,
            previous: null,
            results: mockHostsData,
          });
        } else if (hostFilter.includes('ip:192.168.1.1')) {
          return HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [mockHostsData[0]],
          });
        } else if (hostFilter.includes('ip:192.168.1.2')) {
          return HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [mockHostsData[1]],
          });
        }

        return HttpResponse.json({
          count: 0,
          next: null,
          previous: null,
          results: [],
        });
      }),

      // Mock the assets API response for threat data
      http.get(
        baseUrl + '/appliances/threat/threats_per_asset/',
        ({ request }) => {
          const url = new URL(request.url);
          const asset = url.searchParams.get('asset') || '';

          if (asset === '192.168.1.1') {
            return HttpResponse.json({
              count: mockAsset1ThreatsData.length,
              next: null,
              previous: null,
              results: mockAsset1ThreatsData,
            });
          } else if (asset === '192.168.1.2') {
            return HttpResponse.json({
              count: mockAsset2ThreatsData.length,
              next: null,
              previous: null,
              results: mockAsset2ThreatsData,
            });
          }

          return HttpResponse.json({
            count: 0,
            next: null,
            previous: null,
            results: [],
          });
        },
      ),

      // Mock the threats API response for threat details
      http.get('/undefined/api/v2/appliances/threats', () => {
        return HttpResponse.json({
          count: mockThreatDetails.length,
          next: null,
          previous: null,
          results: mockThreatDetails,
        });
      }),
    );
  });

  test('should render loading state when fetching data', async () => {
    renderWithProviders(
      <BeaconingIPsTable ips={['192.168.1.1', '192.168.1.2']} />,
    );

    // Verify loading state - should see skeleton elements
    expect(screen.getAllByTestId(/skeleton/i).length).toBe(40);
  });

  test('should render hosts data after loading', async () => {
    renderWithProviders(
      <BeaconingIPsTable ips={['192.168.1.1', '192.168.1.2']} />,
      { router: createTestRouter() },
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryAllByTestId(/skeleton/i).length).toBe(0);
    });
    // Additionally wait for threat names to be present to ensure ThreatTag components are fully loaded
    await waitFor(() => {
      expect(screen.getByText('Threat 101')).toBeInTheDocument();
      expect(screen.getByText('Threat 102')).toBeInTheDocument();
    });

    // Verify IP addresses are rendered correctly
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.2')).toBeInTheDocument();

    // Verify Threats are rendered correctly
    expect(screen.getByText('Threat 101')).toBeInTheDocument();
    expect(screen.getByText('Threat 102')).toBeInTheDocument();
    expect(screen.getByText('Threat 103')).toBeInTheDocument();

    // Verify hostnames are rendered correctly
    expect(screen.getByText('host1.example.com')).toBeInTheDocument();
    expect(screen.getByText('host2.example.com')).toBeInTheDocument();

    // Verify network information is rendered correctly
    expect(screen.getAllByText('192.168.1.0/24').length).toBe(2);

    // Verify usernames are rendered correctly
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('user1')).toBeInTheDocument();

    // Verify roles are rendered correctly
    expect(screen.getByText('Domain Controller')).toBeInTheDocument();
    expect(screen.getByText('Printer')).toBeInTheDocument();
  });

  test('should render data for a single IP', async () => {
    renderWithProviders(
      <BeaconingIPsTable ips={['192.168.1.1']} />,
      { router: createTestRouter() },
    );

    // Wait for data to load and ensure all threat tags have finished loading
    await waitFor(() => {
      expect(screen.queryAllByTestId(/skeleton/i).length).toBe(0);
    });

    // Additionally wait for threat names to be present to ensure ThreatTag components are fully loaded
    await waitFor(() => {
      expect(screen.getByText('Threat 101')).toBeInTheDocument();
      expect(screen.getByText('Threat 102')).toBeInTheDocument();
    });

    // Verify only the first IP and its data is shown
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    expect(screen.getByText('host1.example.com')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('Domain Controller')).toBeInTheDocument();

    // Verify the second IP's data is not shown
    expect(screen.queryByText('192.168.1.2')).not.toBeInTheDocument();
    expect(screen.queryByText('host2.example.com')).not.toBeInTheDocument();
    expect(screen.queryByText('user1')).not.toBeInTheDocument();
    expect(screen.queryByText('Printer')).not.toBeInTheDocument();

    // Verify only the threats for the first IP are shown
    expect(screen.getByText('Threat 101')).toBeInTheDocument();
    expect(screen.getByText('Threat 102')).toBeInTheDocument();
    expect(screen.queryByText('Threat 103')).not.toBeInTheDocument();
  });

  test('should handle empty results', async () => {
    // Override the default handler to return empty results
    server.use(
      http.get(baseUrl + '/appliances/host_id/', () => {
        return HttpResponse.json({
          count: 0,
          next: null,
          previous: null,
          results: [],
        });
      }),
    );

    renderWithProviders(<BeaconingIPsTable ips={['192.168.1.3']} />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryAllByTestId(/skeleton/i).length).toBe(0);
    });

    // Verify "No results" message is displayed
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  test('should handle undefined IPs gracefully', async () => {
    renderWithProviders(<BeaconingIPsTable ips={undefined} />);

    // Wait for data loading attempt to complete
    await waitFor(() => {
      expect(screen.queryAllByTestId(/skeleton/i).length).toBe(0);
    });

    // Verify that the component handles undefined IPs gracefully
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });
});
