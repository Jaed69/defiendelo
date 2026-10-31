import { describe, expect, it } from "vitest";
import { newAccountCode, normalizeAccountCode } from "./account";

describe("account codes", () => {
  it("builds a prefixed six-character code without ambiguous characters", () => {
    const code = newAccountCode("docente", new Uint8Array([0, 1, 2, 3, 4, 5]));
    expect(code).toBe("PROFE-234567");
    expect(newAccountCode("alumno", new Uint8Array([30, 31, 40, 50, 60, 70]))).toMatch(/^ALUM-[2-9A-HJKMNP-Z]{6}$/);
  });

  it("accepts lowercase and spaces, and tells the role", () => {
    expect(normalizeAccountCode(" profe 7k2m9q ")).toEqual({ code: "PROFE-7K2M9Q", role: "docente" });
    expect(normalizeAccountCode("ALUM4X9P2R")).toEqual({ code: "ALUM-4X9P2R", role: "alumno" });
  });

  it("rejects anything that is not a code", () => {
    expect(normalizeAccountCode("PROFE-7K2")).toBeNull();
    expect(normalizeAccountCode("PROFE-OOOOOO")).toBeNull();
    expect(normalizeAccountCode("hola")).toBeNull();
  });
});
