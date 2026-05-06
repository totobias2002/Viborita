import type { AuthResponse } from "@/lib/api/viborita";

const AUTH_KEY = "viborita.auth";
const AUTH_EVENT = "viborita:auth-changed";

const notifyAuthChanged = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const getStoredAuth = (): AuthResponse | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    window.localStorage.removeItem(AUTH_KEY);
    return null;
  }
};

export const saveStoredAuth = (value: AuthResponse) => {
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(value));
  notifyAuthChanged();
};

export const clearStoredAuth = () => {
  window.localStorage.removeItem(AUTH_KEY);
  notifyAuthChanged();
};

export const getAuthToken = () => getStoredAuth()?.token || null;

export const onAuthChanged = (listener: () => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const wrapped = () => listener();
  window.addEventListener(AUTH_EVENT, wrapped);
  window.addEventListener("storage", wrapped);

  return () => {
    window.removeEventListener(AUTH_EVENT, wrapped);
    window.removeEventListener("storage", wrapped);
  };
};
