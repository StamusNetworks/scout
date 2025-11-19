import { FilterCategory } from '../constants/query-filter.config';
import { QueryFilterDefinition } from '../model/query-filter';
import { QFBuilder } from './qf-builder';

describe('QFilter Utils', () => {
  describe('Build Alert Tags', () => {
    it.each`
      untagged | informational | relevant | expected
      ${true}  | ${true}       | ${true}  | ${'((NOT alert.tag:*) OR alert.tag:"informational" OR alert.tag:"relevant")'}
      ${false} | ${true}       | ${true}  | ${'(alert.tag:"informational" OR alert.tag:"relevant")'}
      ${false} | ${false}      | ${true}  | ${'(alert.tag:"relevant")'}
      ${false} | ${false}      | ${false} | ${'(alert.tag:"none")'}
      ${true}  | ${false}      | ${false} | ${'((NOT alert.tag:*))'}
      ${false} | ${false}      | ${false} | ${'(alert.tag:"none")'}
    `(
      'should handle untagged: $untagged, informational: $informational, relevant: $relevant',
      ({ untagged, informational, relevant, expected }) => {
        const { Builder } = init();
        const qfilter = Builder.toQFString([], {
          untagged,
          informational,
          relevant,
        });
        expect(qfilter).toEqual(expected);
      },
    );
  });
});

const init = () => {
  return {
    Builder: QFBuilder(MockFiltersDefinition, 'raw'),
  };
};

const MockFiltersDefinition: Record<string, QueryFilterDefinition> = {
  'alert.signature_id': {
    label: 'Signature ID',
    key: 'alert.signature_id',
    type: 'long',
    category: FilterCategory.EVENT,
  },
  'agent.ephemeral_id': {
    label: 'Agent ID',
    key: 'agent.ephemeral_id',
    type: 'text',
    category: FilterCategory.EVENT,
  },
  src_ip: {
    label: 'Source IP',
    key: 'src_ip',
    type: 'ip',
    category: FilterCategory.EVENT,
  },
  alerted: {
    label: 'Alerted',
    key: 'alerted',
    type: 'boolean',
    category: FilterCategory.EVENT,
  },
  'cpu.system_p': {
    label: 'System CPU',
    key: 'cpu.system_p',
    type: 'float',
    category: FilterCategory.EVENT,
  },
  'flow.end': {
    label: 'Flow End',
    key: 'flow.end',
    type: 'date',
    category: FilterCategory.EVENT,
  },
  'geoip.location': {
    label: 'GeoIP Location',
    key: 'geoip.location',
    type: 'geo_point',
    category: FilterCategory.EVENT,
  },
  'geoip.longitude': {
    label: 'GeoIP Longitude',
    key: 'geoip.longitude',
    type: 'half_float',
    category: FilterCategory.EVENT,
  },
};
