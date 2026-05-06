import type {
  CheckoutSelection,
  ReservaSuccessState,
} from "@/lib/api/viborita";

const CHECKOUT_KEY = "viborita.checkout.selection";
const SUCCESS_KEY = "viborita.checkout.success";

export const saveSelection = (selection: CheckoutSelection) => {
  window.sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(selection));
};

export const getSelection = (): CheckoutSelection | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(CHECKOUT_KEY);
  return raw ? (JSON.parse(raw) as CheckoutSelection) : null;
};

export const clearSelection = () => {
  window.sessionStorage.removeItem(CHECKOUT_KEY);
};

export const saveSuccessState = (state: ReservaSuccessState) => {
  window.sessionStorage.setItem(SUCCESS_KEY, JSON.stringify(state));
};

export const getSuccessState = (): ReservaSuccessState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(SUCCESS_KEY);
  return raw ? (JSON.parse(raw) as ReservaSuccessState) : null;
};
