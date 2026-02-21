// Mock for $app modules

export const browser = false;
export const dev = true;
export const building = false;
export const version = 'test-version';

// Navigation mock
export const goto = vi.fn();
export const invalidate = vi.fn();
export const invalidateAll = vi.fn();
export const preloadData = vi.fn();
export const preloadCode = vi.fn();

// Stores mock
export const getStores = () => ({
  page: {
    subscribe: vi.fn((fn: (value: unknown) => void) => {
      fn({
        url: new URL('http://localhost:5173'),
        params: {},
        route: { id: null },
        status: 200,
        error: null,
        data: {},
        form: undefined,
      });
      return () => {};
    }),
  },
  navigating: {
    subscribe: vi.fn((fn: (value: unknown) => void) => {
      fn(null);
      return () => {};
    }),
  },
  updated: {
    subscribe: vi.fn((fn: (value: unknown) => void) => {
      fn(false);
      return () => {};
    }),
    check: vi.fn(),
  },
});

// Environment mock
export const env = {};

// Helpers
function vi() {
  // This is a placeholder - actual vi comes from vitest
  return () => {};
}
