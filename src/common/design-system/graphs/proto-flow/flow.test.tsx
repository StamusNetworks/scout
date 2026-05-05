import { render, screen } from '@testing-library/react';

import * as Save from '@/common/lib/save';
import { Event } from '@/features/events';

import Flow from './flow';
import { ProtoColumn } from './flow.columns';

describe('Flow Component', () => {
  const httpEvent = {
    _id: 'http-event-1',
    '@timestamp': '2021-01-01T00:00:00.000Z',
    dest_port: 80,
    event_type: 'http',
    src_port: 80,
    timestamp: '2021-01-01T00:00:00.000Z',
    app_proto: 'http',
    http: {
      hostname: 'example.com',
      http_method: 'GET',
      url: '/index.html',
      status: 200,
      http_user_agent: 'Mozilla/5.0',
    },
    proto: 'TCP',
    src_ip: '192.168.1.1',
    dest_ip: '10.0.0.1',
  } as Event;

  const httpEventWithMissingValues = {
    _id: 'http-event-2',
    app_proto: 'http',
    http: {
      hostname: 'example2.com',
      // Missing http_method
      url: '/about.html',
      // Missing status
      // Missing http_user_agent
    },
    proto: 'TCP',
    src_ip: '192.168.1.2',
    dest_ip: '10.0.0.2',
  } as Event;

  const tlsEvent = {
    _id: 'tls-event-1',
    app_proto: 'tls',
    tls: {
      ja4: 'ja4-hash-123',
      sni: 'secure.example.com',
      subject: 'CN=secure.example.com',
      issuerdn: 'CN=Example CA',
      version: 'TLS 1.3',
      alpn_tc: 'h2',
    },
    proto: 'TCP',
    src_ip: '192.168.1.3',
    dest_ip: '10.0.0.3',
  } as Event;

  const httpColumns: ProtoColumn[] = [
    {
      title: 'Hostname',
      key: 'http.hostname',
      missing: 'N/A',
    },
    {
      title: 'Method',
      key: 'http.http_method',
      missing: 'N/A',
    },
    {
      title: 'URL',
      key: 'http.url',
      missing: 'N/A',
    },
  ];

  const tlsColumns: ProtoColumn[] = [
    {
      title: 'JA4',
      key: 'tls.ja4',
      missing: 'N/A',
    },
    {
      title: 'SNI',
      key: 'tls.sni',
      missing: 'N/A',
    },
    {
      title: 'Subject',
      key: 'tls.subject',
      missing: 'N/A',
    },
  ];
  const customColumns: ProtoColumn<Event>[] = [
    {
      title: 'Custom Column',
      key: 'custom',
      missing: 'MISSING',
      valFunc: (ev) => {
        return ev.src_ip ? `SRC:${ev.src_ip}` : undefined;
      },
    },
    {
      title: 'Non-Existent Key',
      key: 'does.not.exist',
      missing: 'NOT FOUND',
    },
  ];

  test('should render HTTP column headers with correct counts', () => {
    render(
      <Flow
        events={[httpEvent, httpEventWithMissingValues]}
        columns={httpColumns}
      />,
    );
    expect(screen.getByText('Hostname (2)')).toBeInTheDocument();
    expect(screen.getByText('Method (1)')).toBeInTheDocument();
    expect(screen.getByText('URL (2)')).toBeInTheDocument();
  });

  test('should render TLS column headers with correct counts', () => {
    render(
      <Flow
        events={[tlsEvent]}
        columns={tlsColumns}
      />,
    );
    expect(screen.getByText('JA4 (1)')).toBeInTheDocument();
    expect(screen.getByText('SNI (1)')).toBeInTheDocument();
    expect(screen.getByText('Subject (1)')).toBeInTheDocument();
  });

  test('should handle missing values correctly', () => {
    render(
      <Flow
        events={[httpEventWithMissingValues]}
        columns={httpColumns}
      />,
    );
    expect(screen.getByText('Hostname (1)')).toBeInTheDocument();
    expect(screen.getByText('Method (0)')).toBeInTheDocument();
    expect(screen.getByText('URL (1)')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  test('should handle different event types with same columns', () => {
    const events = [httpEvent, tlsEvent];
    const genericColumns: ProtoColumn[] = [
      {
        title: 'Protocol',
        key: 'proto',
        missing: 'Unknown Protocol',
      },
      {
        title: 'Source IP',
        key: 'src_ip',
        missing: 'Unknown Source',
      },
      {
        title: 'Destination IP',
        key: 'dest_ip',
        missing: 'Unknown Destination',
      },
    ];

    render(
      <Flow
        events={events}
        columns={genericColumns}
      />,
    );
    expect(screen.getByText('Protocol (1)')).toBeInTheDocument();
    expect(screen.getByText('Source IP (2)')).toBeInTheDocument();
    expect(screen.getByText('Destination IP (2)')).toBeInTheDocument();
  });

  test('should explicitly test missing value callback with nested structures', () => {
    const eventWithMissingNestedValues = {
      _id: 'missing-values-event',
      app_proto: 'http',
      proto: 'TCP',
      src_ip: '192.168.1.5',
      dest_ip: '10.0.0.5',
      // http object is completely missing
    } as Event;

    const columnsWithNestedKeys: ProtoColumn[] = [
      {
        title: 'Protocol',
        key: 'proto',
        missing: 'Unknown Protocol',
      },
      {
        title: 'Hostname', // This will be missing
        key: 'http.hostname',
        missing: 'HOSTNAME MISSING',
      },
      {
        title: 'Deep Nested', // This will be missing
        key: 'deeply.nested.value',
        missing: 'DEEP VALUE MISSING',
      },
    ];

    render(
      <Flow
        events={[eventWithMissingNestedValues]}
        columns={columnsWithNestedKeys}
      />,
    );
    expect(screen.getByText('Protocol (1)')).toBeInTheDocument();
    expect(screen.getByText('Hostname (0)')).toBeInTheDocument();
    expect(screen.getByText('Deep Nested (0)')).toBeInTheDocument();
    expect(screen.getByText('HOSTNAME MISSING')).toBeInTheDocument();
    expect(screen.getByText('DEEP VALUE MISSING')).toBeInTheDocument();
  });

  test('should use custom value function when provided', () => {
    render(
      <Flow
        events={[httpEvent]}
        columns={customColumns}
      />,
    );

    expect(screen.getByText('Custom Column (1)')).toBeInTheDocument();
    expect(screen.getByText('Non-Existent Key (0)')).toBeInTheDocument();
  });

  test('should handle array values in event data', () => {
    const eventWithArrays = {
      _id: 'array-event',
      app_proto: 'custom',
      tags: ['tag1', 'tag2'],
      alert: {
        source: {
          net_info: ['192.168.1.0/24', '192.168.1.1/24'],
        },
      },
    } as Event;

    const columnsForArrays: ProtoColumn<Event>[] = [
      {
        title: 'First Tag',
        key: 'tags',
        missing: 'No Tags',
      },
      {
        title: 'Nested Item',
        key: 'alert.source.net_info',
        missing: 'No Items',
      },
      {
        title: 'Array With Custom Function',
        key: 'custom',
        missing: 'No Array',
        valFunc: (ev: Event) => {
          return ev.tags ? ev.tags.join(', ') : undefined;
        },
      },
    ];

    render(
      <Flow
        events={[eventWithArrays]}
        columns={columnsForArrays}
      />,
    );

    expect(screen.getByText('First Tag (1)')).toBeInTheDocument();
    expect(screen.getByText('Nested Item (1)')).toBeInTheDocument();
    expect(
      screen.getByText('Array With Custom Function (1)'),
    ).toBeInTheDocument();
  });

  test('should copy to clipboard and notify', () => {
    const mockSaveToClipboard = vi
      .spyOn(Save, 'saveToClipboard')
      .mockImplementation(() => {});
    render(
      <Flow
        events={[httpEvent]}
        columns={httpColumns}
      />,
    );
    expect(screen.getByText('CTRL + Left click to copy')).toBeInTheDocument();

    const exampleComElement = screen.getByText('example.com');
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
    });
    exampleComElement.dispatchEvent(mouseEvent);
    expect(mockSaveToClipboard).toHaveBeenCalledWith('example.com');
  });
});
