"use client";

import { savedAccountCode } from "@/app/account";

const TAB_KEY = "defiendelo:code:tab";

/**
 * A code entered without "Recordar en este dispositivo" lives only in this tab (sessionStorage), so a
 * shared school computer forgets it when the tab closes. It wins over the remembered one while the tab is open.
 */
export function tabAccountCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(TAB_KEY);
  } catch {
    return null;
  }
}

export function keepForTab(code: string | null) {
  try {
    if (code) window.sessionStorage.setItem(TAB_KEY, code);
    else window.sessionStorage.removeItem(TAB_KEY);
  } catch {
    // Blocked storage: the person types the code again.
  }
}

export function currentAccountCode(): string | null {
  return tabAccountCode() ?? savedAccountCode();
}

/** Per-task submission token, so the same phone reopens its own submission. */
export type SavedSubmission = { sid: string; token: string };

export function submissionKey(assignmentId: string) {
  return `defiendelo:${assignmentId}`;
}

export function readSubmission(assignmentId: string): SavedSubmission | null {
  try {
    return JSON.parse(localStorage.getItem(submissionKey(assignmentId)) ?? "null");
  } catch {
    return null;
  }
}

export function writeSubmission(assignmentId: string, saved: SavedSubmission | null) {
  try {
    if (saved) localStorage.setItem(submissionKey(assignmentId), JSON.stringify(saved));
    else localStorage.removeItem(submissionKey(assignmentId));
  } catch {
    // Blocked storage: the student can still open it from «Mis evaluaciones» with the code.
  }
}
