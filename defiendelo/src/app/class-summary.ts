function students(n: number) {
  return n === 1 ? "1 alumno" : `${n} alumnos`;
}

function listNames(names: string[]) {
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}

/** The one sentence at the top of the submissions screen: who handed in, who needs help, who is still answering. */
export function classSummary({ handedIn, needHelp, answering }: { handedIn: number; needHelp: string[]; answering: number }) {
  const parts: string[] = [];
  if (handedIn > 0) {
    parts.push(`${students(handedIn)} ${handedIn === 1 ? "entregó" : "entregaron"}.`);
    if (needHelp.length > 0) parts.push(`${needHelp.length === 1 ? "Necesita" : "Necesitan"} ayuda: ${listNames(needHelp)}.`);
    else parts.push(handedIn === 1 ? "No necesita ayuda." : "Nadie necesita ayuda.");
  }
  if (answering > 0) parts.push(`${students(answering)} ${answering === 1 ? "está" : "están"} respondiendo ahora.`);
  return parts.length > 0 ? parts.join(" ") : "Todavía nadie entregó.";
}
