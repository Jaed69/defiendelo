"use client";

const KEY = "defiendelo:code";
// Set by /entrar when "Recordar en este dispositivo" is unchecked: lives only while the tab is open.
const TAB_KEY = "defiendelo:code:tab";

/**
 * The PROFE- or ALUM- code this device remembers. Stored only on the device the person chose
 * ("Recordar en este dispositivo"); never in a URL. Storage can be blocked, so every access is guarded.
 */
export function savedAccountCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(TAB_KEY) ?? window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function rememberAccountCode(code: string) {
  try {
    window.localStorage.setItem(KEY, code);
  } catch {
    // Private mode or blocked storage: the person can still type the code next time.
  }
}

export function forgetAccountCode() {
  try {
    window.localStorage.removeItem(KEY);
    window.sessionStorage.removeItem(TAB_KEY);
  } catch {
    // Nothing stored.
  }
}

export function isTeacherCode(code: string | null): boolean {
  return Boolean(code?.startsWith("PROFE-"));
}
