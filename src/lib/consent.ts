import { useSyncExternalStore } from "react";

export type ConsentCategory = "necessary" | "analytics" | "marketing";
export interface ConsentState {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  ts: number | null;
  decided: boolean;
}

const STORAGE_KEY = "zoryn.cookie-consent.v1";
const OPEN_EVENT = "zoryn:cookie-open";
const CHANGE_EVENT = "zoryn:cookie-change";

const defaultState: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  ts: null,
  decided: false,
};

function read(): ConsentState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      necessary: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      ts: parsed.ts ?? null,
      decided: !!parsed.decided,
    };
  } catch {
    return defaultState;
  }
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export function setConsent(next: Partial<Pick<ConsentState, "analytics" | "marketing">>) {
  if (typeof window === "undefined") return;
  const current = read();
  const value: ConsentState = {
    necessary: true,
    analytics: next.analytics ?? current.analytics,
    marketing: next.marketing ?? current.marketing,
    ts: Date.now(),
    decided: true,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event(CHANGE_EVENT));
  emit();
}

export function acceptAll() {
  setConsent({ analytics: true, marketing: true });
}

export function rejectAll() {
  setConsent({ analytics: false, marketing: false });
}

export function openConsent() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenConsent(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(OPEN_EVENT, cb);
  return () => window.removeEventListener(OPEN_EVENT, cb);
}

export function useConsent(): ConsentState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      const handler = () => cb();
      if (typeof window !== "undefined") window.addEventListener(CHANGE_EVENT, handler);
      return () => {
        listeners.delete(cb);
        if (typeof window !== "undefined") window.removeEventListener(CHANGE_EVENT, handler);
      };
    },
    read,
    () => defaultState,
  );
}
