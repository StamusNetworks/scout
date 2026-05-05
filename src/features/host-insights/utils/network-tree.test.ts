import { getNetNodes } from './network-tree';

describe('Network tree utils', () => {
  describe('Computing the network nodes', () => {
    it('Should handle a simple network', () => {
      const net = 'organization-acme';
      expect(getNetNodes(net)).toEqual(['organization-acme']);
    });
    it('Should handle a network with multiple depths', () => {
      const net = 'domain-controller.infra.organization-acme';
      expect(getNetNodes(net)).toEqual([
        'domain-controller.infra.organization-acme',
        'infra.organization-acme',
        'organization-acme',
      ]);
    });
  });
});
