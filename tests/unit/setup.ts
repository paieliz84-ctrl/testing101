import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock crypto for consistent tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-12345',
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    subtle: {
      importKey: vi.fn(),
      deriveBits: vi.fn(),
      digest: vi.fn(),
    },
  },
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Clean up after each test
import { cleanup } from '@testing-library/svelte';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
