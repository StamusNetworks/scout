import { buildSignatureParams } from '../builders/build-signature-params';
import { QueryFilterState } from '../model/query-filter';

const makeFilter = (
  overrides: Partial<QueryFilterState> & {
    key: string;
    value: string | number;
  },
): QueryFilterState => ({
  id: '1',
  is_suspended: false,
  is_negated: false,
  is_wildcarded: false,
  ...overrides,
});

describe('buildSignatureParams', () => {
  it('should comma-separate multiple content filters', () => {
    const filters = [
      makeFilter({ id: '1', key: 'content', value: 'foo' }),
      makeFilter({ id: '2', key: 'content', value: 'bar' }),
    ];
    const result = buildSignatureParams(filters);
    expect(result?.content).toBe('foo,bar');
  });

  it('should comma-separate multiple msg filters', () => {
    const filters = [
      makeFilter({ id: '1', key: 'msg', value: 'hello' }),
      makeFilter({ id: '2', key: 'msg', value: 'world' }),
    ];
    const result = buildSignatureParams(filters);
    expect(result?.msg).toBe('hello,world');
  });

  it('should comma-separate multiple negated content filters', () => {
    const filters = [
      makeFilter({ id: '1', key: 'content', value: 'foo', is_negated: true }),
      makeFilter({ id: '2', key: 'content', value: 'bar', is_negated: true }),
    ];
    const result = buildSignatureParams(filters);
    expect(result?.not_in_content).toBe('foo,bar');
  });

  it('should handle a single content filter without commas', () => {
    const filters = [makeFilter({ key: 'content', value: 'only' })];
    const result = buildSignatureParams(filters);
    expect(result?.content).toBe('only');
  });

  it('should skip suspended filters', () => {
    const filters = [
      makeFilter({ id: '1', key: 'content', value: 'active' }),
      makeFilter({
        id: '2',
        key: 'content',
        value: 'suspended',
        is_suspended: true,
      }),
    ];
    const result = buildSignatureParams(filters);
    expect(result?.content).toBe('active');
  });

  it('should return undefined when no signature filters exist', () => {
    expect(buildSignatureParams([])).toBeUndefined();
  });
});
