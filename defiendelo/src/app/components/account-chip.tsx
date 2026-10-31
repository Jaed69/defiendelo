"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { forgetAccountCode, savedAccountCode } from "@/app/account";

/**
 * App-bar corner: the code this device remembers ("PROFE-7K2M9Q" + Salir), or a way in when there is none.
 * Rendered after mount because the code lives in this device's storage, not on the server.
 */
export function AccountChip({ enterLabel = "Entrar con mi código" }: { enterLabel?: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCode(savedAccountCode());
    setReady(true);
  }, []);

  if (!ready) return <span className="min-h-11" aria-hidden="true" />;

  if (!code) {
    return (
      <Link href="/entrar" className="btn-secondary btn-sm">
        {enterLabel}
      </Link>
    );
  }

  const home = code.startsWith("PROFE-") ? "/docente" : "/alumno";
  return (
    <div className="flex items-center gap-3">
      <Link href={home} className="chip chip-brand font-mono" aria-label={`Tu código: ${code}. Ver lo tuyo`}>
        {code}
      </Link>
      <button
        type="button"
        className="btn-quiet"
        onClick={() => {
          forgetAccountCode();
          setCode(null);
        }}
      >
        Salir
      </button>
    </div>
  );
}
