export const emptyPaginated = {
  count: 0,
  next: null,
  previous: null,
  results: [] as never[],
};

export const mockHost = {
  ip: '192.168.1.100',
  host_id: {
    hostname_count: 1,
    'http.user_agent_count': 0,
    roles_count: 1,
    'tls.ja4_count': 0,
    services_count: 2,
    client_service_count: 0,
    username_count: 1,
    first_seen: '2026-01-01T00:00:00Z',
    last_seen: '2026-03-17T10:00:00Z',
    client_service: [],
    net_info: [
      {
        agg: '192.168.1.0/24',
        first_seen: '2026-01-01T00:00:00Z',
        last_seen: '2026-03-17T10:00:00Z',
      },
    ],
    hostname: [
      {
        host: 'workstation-01.local',
        first_seen: '2026-01-01T00:00:00Z',
        last_seen: '2026-03-17T10:00:00Z',
      },
    ],
    username: [
      {
        user: 'admin',
        first_seen: '2026-01-01T00:00:00Z',
        last_seen: '2026-03-17T10:00:00Z',
      },
    ],
    roles: [
      {
        name: 'dhcp',
        first_seen: '2026-01-01T00:00:00Z',
        last_seen: '2026-03-17T10:00:00Z',
      },
    ],
    services: [],
    net_info_count: 1,
    tenant: 1,
    in_home_net: true,
  },
};

export const mockHostWithHits = { ...mockHost, hits: 15 };
