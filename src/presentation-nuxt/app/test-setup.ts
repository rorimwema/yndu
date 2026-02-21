// Global test setup
// Provides a working in-memory localStorage for stores that use
// import.meta.client guards + localStorage in the happy-dom Nuxt test env.

const storage = new Map<string, string>();

const localStorageMock = {
  getItem(key: string): string | null {
    return storage.get(key) ?? null;
  },
  setItem(key: string, value: string): void {
    storage.set(key, value);
  },
  removeItem(key: string): void {
    storage.delete(key);
  },
  clear(): void {
    storage.clear();
  },
  get length(): number {
    return storage.size;
  },
  key(index: number): string | null {
    return [...storage.keys()][index] ?? null;
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// Clear storage between tests to prevent cross-contamination
import { beforeEach } from 'vitest';
beforeEach(() => {
  storage.clear();
});
