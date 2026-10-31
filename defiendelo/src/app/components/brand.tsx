import Link from "next/link";
import { QuoteIcon } from "./icons";

/**
 * Brand mark: a quote mark in the brand square. The product quotes the student's own words as the
 * evidence of every grade ("Sale de: …"), so the mark says "your words, quoted". A chat bubble was
 * dropped: it read as one more chatbot.
 */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-grid shrink-0 place-items-center rounded-[10px] bg-brand text-white"
      style={{ width: size, height: size }}
    >
      <QuoteIcon size={Math.round(size * 0.55)} />
    </span>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-2.5 font-display text-2xl font-extrabold tracking-tight text-ink">
      <LogoMark />
      Defiéndelo
    </Link>
  );
}

/** Handwritten red-pen remark with a small arrow; decorative, so it is hidden from assistive tech. */
export function TeacherNote({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`note pointer-events-none inline-flex items-center gap-2 ${className}`} aria-hidden="true">
      <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
        <path d="M2 20C10 6 20 3 32 6M32 6L25 2M32 6L27 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </span>
  );
}

export function AppBar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="app-bar">
      <div className="container-page flex min-h-16 flex-wrap items-center justify-between gap-x-8 gap-y-3 py-3">{children}</div>
    </header>
  );
}
