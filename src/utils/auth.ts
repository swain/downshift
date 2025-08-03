export const STORAGE_KEY = "downshift_account_key";

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

export const Auth = {
  getCurrentKey: () => localStorage.getItem(STORAGE_KEY),
  setCurrentKey: (key: string) => localStorage.setItem(STORAGE_KEY, key),
  clearCurrentKey: () => localStorage.removeItem(STORAGE_KEY),
};
