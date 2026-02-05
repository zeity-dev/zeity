const localStorage = typeof window !== 'undefined' ? window.localStorage : null;

export const useLocalStorage = () => ({
  getItem: function <T>(key: string): T | null {
    try {
      const raw = localStorage?.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  setItem: function (key: string, value: unknown) {
    const raw = JSON.stringify(value);
    localStorage?.setItem(key, raw);
  },
  removeItem: function (key: string) {
    localStorage?.removeItem(key);
  },
});
