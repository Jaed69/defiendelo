import type { AccountRole } from "./types";

// No 0/O, 1/I/L: the code is read aloud and copied by hand.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const PREFIX: Record<AccountRole, string> = { docente: "PROFE", alumno: "ALUM" };

/** A new account code such as PROFE-7K2M9Q; random bytes come from the caller so tests stay deterministic. */
export function newAccountCode(role: AccountRole, bytes: Uint8Array): string {
  const body = Array.from(bytes.slice(0, 6), (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `${PREFIX[role]}-${body}`;
}

/** Upper-cases, trims and drops spaces so "profe 7k2m9q" works; null when it is not a code. */
export function normalizeAccountCode(input: string): { code: string; role: AccountRole } | null {
  const compact = input.toUpperCase().replace(/\s+/g, "");
  const match = /^(PROFE|ALUM)-?([2-9A-HJKMNP-Z]{6})$/.exec(compact);
  if (!match) return null;
  return { code: `${match[1]}-${match[2]}`, role: match[1] === "PROFE" ? "docente" : "alumno" };
}
