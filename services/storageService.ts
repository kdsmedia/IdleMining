import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'idle_mining_';

export const storage = {
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const raw = await AsyncStorage.getItem(PREFIX + key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  set: async (key: string, value: unknown): Promise<void> => {
    try {
      await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {}
  },
  remove: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(PREFIX + key);
    } catch {}
  },
  clear: async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const miningKeys = keys.filter(k => k.startsWith(PREFIX));
      await AsyncStorage.multiRemove(miningKeys);
    } catch {}
  },
};
