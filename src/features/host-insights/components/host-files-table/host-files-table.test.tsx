import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import type { SortingState } from '@tanstack/react-table';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { BreadcrumbProvider } from '@/common/design-system/molecules/breadcrumbs';
import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

import { HostFilesTable } from './host-files-table';

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

const baseFileinfoEvent = {
  _id: 'file-1',
  '@timestamp': '2026-03-17T10:00:00Z',
  timestamp: '2026-03-17T10:00:00Z',
  event_type: 'fileinfo',
  app_proto: 'http',
  src_ip: '192.168.1.5',
  src_port: 12345,
  dest_ip: '10.0.0.1',
  dest_port: 80,
  fileinfo: {
    filename: 'invoice.pdf',
    mimetype: 'application/pdf',
    gaps: false,
    sha256: 'abc123def456',
    tx_id: 1,
    state: 'CLOSED',
    size: 86200,
    stored: true,
  },
};

const chunkedEvent = {
  ...baseFileinfoEvent,
  _id: 'file-chunked-1',
  fileinfo: { ...baseFileinfoEvent.fileinfo, filename: 'big-archive.zip' },
  http: {
    content_range: {
      raw: 'bytes 0-99/300',
      start: 0,
      end: 99,
      size: 300,
    },
  },
};

const chunkedEvent2 = {
  ...baseFileinfoEvent,
  _id: 'file-chunked-2',
  fileinfo: { ...baseFileinfoEvent.fileinfo, filename: 'big-archive.zip' },
  http: {
    content_range: {
      raw: 'bytes 100-199/300',
      start: 100,
      end: 199,
      size: 300,
    },
  },
};

const chunkedEvent3 = {
  ...baseFileinfoEvent,
  _id: 'file-chunked-3',
  fileinfo: { ...baseFileinfoEvent.fileinfo, filename: 'big-archive.zip' },
  http: {
    content_range: {
      raw: 'bytes 200-299/300',
      start: 200,
      end: 299,
      size: 300,
    },
  },
};

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: ['/hosts/192.168.1.5/files'],
    }),
  });

const defaultProps = {
  hostId: '192.168.1.5',
  page: 1,
  pageSize: 10,
  sorting: [] as SortingState,
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
  onSortingChange: vi.fn(),
};

const renderTable = async (overrides?: Partial<typeof defaultProps>) => {
  const props = { ...defaultProps, ...overrides };
  return renderWithProviders(
    <BreadcrumbProvider>
      <HostFilesTable {...props} />
    </BreadcrumbProvider>,
    {
      router: createTestRouter(),
      preloadedState: { ...initialState },
    },
  );
};

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/rules/es/events_tail/', () =>
      HttpResponse.json(emptyPaginated),
    ),
  );
});

describe('HostFilesTable', () => {
  it('issues a single events_tail request with src_ip/dest_ip/event_type:fileinfo qfilter', async () => {
    const seen: URL[] = [];
    server.use(
      http.get(baseUrl + '/rules/es/events_tail/', ({ request }) => {
        seen.push(new URL(request.url));
        return HttpResponse.json(emptyPaginated);
      }),
    );

    await renderTable();

    await waitFor(() => {
      expect(seen.length).toBeGreaterThanOrEqual(1);
    });
    const qfilter = seen[0].searchParams.get('qfilter') ?? '';
    expect(qfilter).toContain('src_ip:"192.168.1.5"');
    expect(qfilter).toContain('dest_ip:"192.168.1.5"');
    expect(qfilter).toContain('event_type:fileinfo');
  });

  it('renders one row per fileinfo event with the expected columns', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/events_tail/', () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [baseFileinfoEvent],
        }),
      ),
    );

    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
    });
    expect(screen.getByText(/abc123/)).toBeInTheDocument();
    expect(screen.getByText('application/pdf')).toBeInTheDocument();
  });

  it('renders the sha256 split into two lines of (near-)equal length', async () => {
    const longShaEvent = {
      ...baseFileinfoEvent,
      _id: 'file-long-sha',
      fileinfo: {
        ...baseFileinfoEvent.fileinfo,
        sha256:
          'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
      },
    };
    server.use(
      http.get(baseUrl + '/rules/es/events_tail/', () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [longShaEvent],
        }),
      ),
    );

    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
    });
    const shaCell = screen.getByText(/abcdef0123456789abcdef0123456789/);
    expect(shaCell.textContent).toBe(
      'abcdef0123456789abcdef0123456789\nabcdef0123456789abcdef0123456789',
    );
  });

  it('shows the raw content_range for chunked events and nothing for non-chunked', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/events_tail/', () =>
        HttpResponse.json({
          count: 2,
          next: null,
          previous: null,
          results: [chunkedEvent, baseFileinfoEvent],
        }),
      ),
    );

    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('bytes 0-99/300')).toBeInTheDocument();
    });
    expect(screen.queryByText('Yes')).not.toBeInTheDocument();
    expect(screen.queryByText('No')).not.toBeInTheDocument();
  });

  it('renders multi-chunk events as separate rows with their own raw ranges', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/events_tail/', () =>
        HttpResponse.json({
          count: 3,
          next: null,
          previous: null,
          results: [chunkedEvent, chunkedEvent2, chunkedEvent3],
        }),
      ),
    );

    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('bytes 0-99/300')).toBeInTheDocument();
    });
    expect(screen.getByText('bytes 100-199/300')).toBeInTheDocument();
    expect(screen.getByText('bytes 200-299/300')).toBeInTheDocument();
  });

  it('renders nothing in the Chunk column when content_range has no raw', async () => {
    const chunkedNoRaw = {
      ...baseFileinfoEvent,
      _id: 'file-no-raw',
      http: { content_range: { start: 0, end: 99, size: 300 } },
    };
    server.use(
      http.get(baseUrl + '/rules/es/events_tail/', () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [chunkedNoRaw],
        }),
      ),
    );

    await renderTable();

    await waitFor(() => {
      expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
    });
    expect(screen.queryByText(/bytes /)).not.toBeInTheDocument();
  });

  it('renders the empty state when no events are returned', async () => {
    await renderTable();

    await waitFor(() => {
      expect(screen.getByText(/No files found/i)).toBeInTheDocument();
    });
  });

  it('forwards the page prop to the API request', async () => {
    let receivedPage: string | null = null;
    server.use(
      http.get(baseUrl + '/rules/es/events_tail/', ({ request }) => {
        receivedPage = new URL(request.url).searchParams.get('page');
        return HttpResponse.json(emptyPaginated);
      }),
    );

    await renderTable({ page: 2 });

    await waitFor(() => {
      expect(receivedPage).toBe('2');
    });
  });

  it('serializes timestamp sorting into the ordering query param', async () => {
    let receivedOrdering: string | null = null;
    server.use(
      http.get(baseUrl + '/rules/es/events_tail/', ({ request }) => {
        receivedOrdering = new URL(request.url).searchParams.get('ordering');
        return HttpResponse.json(emptyPaginated);
      }),
    );

    await renderTable({ sorting: [{ id: 'timestamp', desc: false }] });

    await waitFor(() => {
      expect(receivedOrdering).toBe('timestamp');
    });
  });

  it('defaults ordering to -timestamp when no sorting is provided', async () => {
    let receivedOrdering: string | null = null;
    server.use(
      http.get(baseUrl + '/rules/es/events_tail/', ({ request }) => {
        receivedOrdering = new URL(request.url).searchParams.get('ordering');
        return HttpResponse.json(emptyPaginated);
      }),
    );

    await renderTable();

    await waitFor(() => {
      expect(receivedOrdering).toBe('-timestamp');
    });
  });
});
