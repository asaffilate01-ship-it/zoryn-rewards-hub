import { useSyncExternalStore } from "react";

const KEY = "zoryn.activeMerchantId";
const listeners = new Set<() => void>();

function emit() { listeners.forEach((l) => l()); }
function subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb); }
function getSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}
function getServerSnapshot(): string | null { return null; }

export function useActiveMerchantId() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
export function setActiveMerchantId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(KEY, id);
  else window.localStorage.removeItem(KEY);
  emit();
}
