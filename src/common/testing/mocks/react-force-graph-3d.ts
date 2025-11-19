// Mock react-force-graph-3d to prevent WebGL initialization issues in tests
vi.mock('react-force-graph-3d', () => {
  const MockForceGraph3D = () => {
    return vi.fn(() => ({
      type: 'div',
      props: {
        'data-testid': 'force-graph-3d-mock',
        children: 'Force Graph 3D Mock',
      },
    }))();
  };

  return {
    default: MockForceGraph3D,
    ForceGraphMethods: vi.fn(),
    NodeObject: vi.fn(),
  };
});
