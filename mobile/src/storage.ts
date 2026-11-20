import * as SecureStore from "expo-secure-store";
import { SessionStore, StoredSession, normalizeUrl } from "./client";
const KEY = "drevos.session.v1";
export const secureStore: SessionStore = {
  async load() {
    const text = await SecureStore.getItemAsync(KEY);
    if (!text) return null;
    try {
      const value = JSON.parse(text) as StoredSession;
      if (
        typeof value.refreshToken !== "string" ||
        !value.refreshToken ||
        !["de", "en"].includes(value.language)
      )
        throw new Error("invalid");
      value.url = normalizeUrl(value.url);
      return value;
    } catch {
      await SecureStore.deleteItemAsync(KEY);
      return null;
    }
  },
  save(value) {
    return SecureStore.setItemAsync(KEY, JSON.stringify(value), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  clear() {
    return SecureStore.deleteItemAsync(KEY);
  },
};
