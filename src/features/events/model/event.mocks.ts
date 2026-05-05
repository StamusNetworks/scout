import { Event } from '@/features/events/model/event';

export const makeEvent = (overrides: Partial<Event> = {}): Event => ({
  _id: 'evt-1',
  '@timestamp': '2026-01-12T08:00:00Z',
  timestamp: '2026-01-12T08:00:00Z',
  app_proto: 'dns',
  dest_ip: '8.8.8.8',
  dest_port: 53,
  event_type: 'alert',
  src_ip: '192.168.1.5',
  src_port: 12345,
  ...overrides,
});

export const makeNrdEvent = (overrides: Partial<Event> = {}): Event =>
  makeEvent({
    _id: 'nrd-1',
    app_proto: 'dns',
    dns: { type: 'query', rrname: 'newly-registered.io', id: 1, tx_id: 1 },
    alert: { signature: 'ET NRD Domain', signature_id: 1001 },
    flow: {
      src_ip: '192.168.1.5',
      src_port: 12345,
      dest_ip: '8.8.8.8',
      dest_port: 53,
      start: '2026-01-12T08:00:00Z',
      state: 'new',
      alerted: true,
    },
    ...overrides,
  });

export const makeSightingEvent = (overrides: Partial<Event> = {}): Event =>
  makeEvent({
    _id: 'sighting-1',
    app_proto: 'stamus',
    event_type: 'discovery',
    discovery: {
      asset_role: ['victim'],
      key: 'hostname',
      asset: '192.168.1.5',
      value: 'WORKSTATION-05',
      asset_net: '192.168.1.0/24',
    },
    ...overrides,
  });

export const makeSightingApiEvent = (overrides: Partial<Event> = {}): Event =>
  makeSightingEvent({ _id: 'sighting-api-1', ...overrides });

export const makeFileEvent = (overrides: Partial<Event> = {}): Event =>
  makeEvent({
    _id: 'file-1',
    app_proto: 'smb',
    event_type: 'fileinfo',
    fileinfo: {
      filename: 'invoice.exe',
      mimetype: 'application/x-dosexec',
      gaps: false,
      sha256: 'abc123',
      tx_id: 1,
      state: 'CLOSED',
      size: 86200,
      stored: false,
    },
    flow: {
      src_ip: '10.0.0.1',
      src_port: 445,
      dest_ip: '192.168.1.5',
      dest_port: 54321,
      start: '2026-01-12T12:45:00Z',
      state: 'closed',
      alerted: false,
    },
    ...overrides,
  });

export const makeLateralEvent = (overrides: Partial<Event> = {}): Event =>
  makeEvent({
    _id: 'lateral-1',
    app_proto: 'smb',
    event_type: 'alert',
    alert: {
      signature: 'SMB Lateral Movement',
      signature_id: 2001,
      lateral: 'smb_exec',
    },
    flow: {
      src_ip: '10.0.0.1',
      src_port: 445,
      dest_ip: '10.0.0.7',
      dest_port: 445,
      start: '2026-01-12T15:22:00Z',
      state: 'closed',
      alerted: true,
    },
    ...overrides,
  });

export const makeHuntingEvent = (overrides: Partial<Event> = {}): Event =>
  makeEvent({
    _id: 'hunting-1',
    app_proto: 'tcp',
    event_type: 'alert',
    alert: {
      signature: 'Recon Activity Detected',
      signature_id: 3001,
    },
    flow: {
      src_ip: '192.168.1.5',
      src_port: 56789,
      dest_ip: '10.0.0.254',
      dest_port: 80,
      start: '2026-01-12T16:01:00Z',
      state: 'closed',
      alerted: true,
    },
    ...overrides,
  });
