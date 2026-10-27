import AsyncStorage from '@react-native-async-storage/async-storage';

/** Reads a JSON value saved under `key`. Resolves null when nothing has been saved yet. */
export async function readJSON<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw === null ? null : (JSON.parse(raw) as T);
}

export async function writeJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
