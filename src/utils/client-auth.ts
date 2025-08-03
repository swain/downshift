"use client";

import Cookies from "js-cookie";
import { create } from "zustand";

export const generateAccountKey = () => {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);

  const randomizedString = Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `u_${randomizedString}`;
};

export const isValidAccountKey = (key: string) => {
  if (!key.startsWith("u_")) {
    return false;
  }
  if (key.length > 120) {
    return false;
  }
  // alphanumeric
  if (!/[a-z0-9]/.test(key.slice(2))) {
    return false;
  }
  return true;
};

const COOKIE_NAME = "account_key";

const _store = create(() => ({
  currentAccount: Cookies.get(COOKIE_NAME) || "",
}));

export const CurrentAccount = {
  get: () => _store.getState().currentAccount,
  set: (key: string) => {
    Cookies.set(COOKIE_NAME, key, {
      secure: true,
      // 10 years baby
      expires: 365 * 10,
    });
    _store.setState({ currentAccount: key });
    // Reload page to sync server-side auth state
    window.location.reload();
  },
  clear: () => {
    Cookies.remove(COOKIE_NAME);
    _store.setState({ currentAccount: "" });
    // Reload page to sync server-side auth state
    window.location.reload();
  },
};

export const useCurrentAccount = () => {
  return _store((state) => state.currentAccount);
};
