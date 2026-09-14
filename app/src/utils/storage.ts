// Safari Private Mode blocks localStorage. This wrapper falls back to sessionStorage.
// Also wraps all accesses in try/catch to prevent crashes on strict browsers.

export const safeStorage = {
  set: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Safari private mode or storage quota exceeded — fall back to sessionStorage
      try {
        sessionStorage.setItem(key, value);
      } catch (e2) {
        console.warn('[safeStorage] Could not save key:', key);
      }
    }
  },

  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key) ?? sessionStorage.getItem(key);
    } catch (e) {
      try {
        return sessionStorage.getItem(key);
      } catch (e2) {
        return null;
      }
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // ignore
    }
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      // ignore
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (e) {
      // ignore
    }
    try {
      sessionStorage.clear();
    } catch (e) {
      // ignore
    }
  }
};
