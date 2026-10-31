/** A published figure that shows how often students hand this kind of task to an AI. */
export interface Evidence {
  text: string;
  source: string;
  url: string;
}

/** A ready-made task a teacher can load into the form, with the reason it needs a redesign. */
export interface ExampleTask {
  id: string;
  subject: string;
  level: string;
  topic: string;
  /** What kind of task it is, the premise the redesign changes: an essay, a reading quiz, a lab report… */
  kind: string;
  title: string;
  /** The task as teachers usually hand it out today. */
  original: string;
  /** What an AI can hand in on its own, with no student behind it. */
  aiAlone: string;
  /** What the student would have to explain in the defense after the redesign. */
  defense: string;
  evidence?: Evidence;
}

const PISA_2025_PERU = "https://larepublica.pe/sociedad/2026/09/08/peru-retrocede-en-prueba-pisa-2025-y-no-alcanza-niveles-minimos-en-lectura-matematica-y-ciencias-439808";

export const EXAMPLES: ExampleTask[] = [
  {
    id: "comunicacion-texto-argumentativo",
    kind: "Ensayo argumentativo",
    subject: "Comunicación",
    level: "4.º de secundaria",
    topic: "Texto argumentativo",
    title: "¿Celulares en el colegio?",
    original:
      "Escribe un texto argumentativo de 400 palabras sobre la pregunta: ¿debería prohibirse el uso del celular durante el horario escolar en los colegios del Perú? Plantea una tesis clara, presenta al menos dos argumentos con evidencias y un contraargumento refutado. Cierra con una conclusión que retome tu postura.",
    aiAlone: "Un texto bien estructurado, con tesis, argumentos y conectores correctos, escrito sin ninguna opinión propia del alumno.",
    defense: "Por qué eligió esa tesis, de dónde salió su evidencia y cómo responde en el momento a un contraargumento que no estaba en su texto.",
    evidence: { text: "36% de los alumnos peruanos de 15 años usa chatbots para redactar trabajos escritos.", source: "PISA 2025", url: PISA_2025_PERU },
  },
  {
    id: "comunicacion-comprension-lectora",
    kind: "Cuestionario de lectura",
    subject: "Comunicación",
    level: "3.º de secundaria",
    topic: "Comprensión lectora",
    title: "Los gallinazos sin plumas",
    original:
      "Lee el cuento «Los gallinazos sin plumas» de Julio Ramón Ribeyro y responde: (1) ¿Cuál es el tema central? (2) ¿Qué representa don Santos? (3) Explica el significado del título. Finalmente, redacta un resumen de 150 palabras.",
    aiAlone: "Las tres respuestas y el resumen, correctos, sin haber leído el cuento: es una obra muy comentada en internet.",
    defense: "Qué escena le impactó y por qué, cómo cambia su lectura de don Santos si se pone en el lugar de Efraín y qué parte del cuento se parece a algo que vio en su ciudad.",
    evidence: { text: "40% de los alumnos peruanos de 15 años usa chatbots para resumir textos.", source: "PISA 2025", url: PISA_2025_PERU },
  },
  {
    id: "matematica-funcion-lineal",
    kind: "Problema",
    subject: "Matemática",
    level: "3.º de secundaria",
    topic: "Función lineal",
    title: "¿Qué mototaxi conviene?",
    original:
      "Una mototaxi en Juliaca cobra S/ 3 de banderazo más S/ 1,50 por kilómetro. Otra empresa cobra S/ 2,50 por kilómetro sin banderazo. Plantea la función de costo de cada una, determina a partir de qué distancia conviene cada servicio y represéntalo gráficamente.",
    aiAlone: "Las dos funciones, el punto de corte en 3 km, la tabla y la descripción de la gráfica, completas y correctas en segundos.",
    defense: "Qué significa el punto donde se cruzan las rectas, por qué una recta empieza más arriba que la otra y qué cambia si la primera empresa sube su banderazo.",
    evidence: {
      text: "Más del 40% de los adolescentes de EE. UU. ya usó chatbots para resolver problemas de matemática.",
      source: "Pew Research Center, 2026",
      url: "https://www.pewresearch.org/internet/2026/02/24/how-teens-use-and-view-ai/",
    },
  },
  {
    id: "sociales-guerra-del-pacifico",
    kind: "Monografía",
    subject: "Ciencias Sociales",
    level: "5.º de secundaria",
    topic: "Historia del Perú",
    title: "Monografía: la Guerra del Pacífico",
    original:
      "Elabora una monografía de 4 páginas sobre las causas y consecuencias de la Guerra del Pacífico (1879-1884) para el Perú. Incluye introducción, desarrollo con al menos tres fuentes citadas y conclusiones.",
    aiAlone: "Una monografía ordenada, con causas, consecuencias, citas con formato correcto y una conclusión genérica.",
    defense: "Qué diferencia encontró entre sus fuentes, en cuál confía más y por qué, y cómo se ve hoy alguna consecuencia de la guerra en su región.",
    evidence: { text: "43% de los alumnos peruanos de 15 años usa chatbots para investigar.", source: "PISA 2025", url: PISA_2025_PERU },
  },
  {
    id: "ciencia-informe-indagacion",
    kind: "Informe de laboratorio",
    subject: "Ciencia y Tecnología",
    level: "2.º de secundaria",
    topic: "Indagación científica",
    title: "La pastilla efervescente y la temperatura",
    original:
      "Indaga: ¿cómo influye la temperatura del agua en el tiempo de disolución de una pastilla efervescente? Formula tu hipótesis, identifica las variables, registra tus datos en una tabla con tres repeticiones y elabora un gráfico. Redacta el informe con discusión y conclusiones.",
    aiAlone: "Hipótesis, variables, una tabla con datos inventados pero creíbles, la descripción del gráfico y las conclusiones.",
    defense: "Cómo midió el tiempo, por qué sus tres repeticiones no dieron igual, qué hizo para que el agua estuviera a la temperatura que dice y qué haría distinto.",
  },
  {
    id: "ingles-festival",
    kind: "Redacción",
    subject: "Inglés",
    level: "2.º de secundaria",
    topic: "Simple present",
    title: "A festival from my region",
    original:
      "Write an email (120-150 words) to a pen pal from Canada describing a traditional festival from your region, such as Inti Raymi or the Fiesta de la Candelaria. Use the simple present and at least five time expressions.",
    aiAlone: "Un correo sin errores, con el presente simple, cinco expresiones de tiempo y datos correctos del festival.",
    defense: "Responder en inglés preguntas sobre el festival que eligió y lo que hace su familia ese día, y explicar por qué usó el presente simple.",
    evidence: {
      text: "Traducir es el tercer uso más común de la IA entre los adolescentes que la usan (41%).",
      source: "Common Sense Media, 2024",
      url: "https://www.commonsensemedia.org/press-releases/new-report-shows-students-are-embracing-artificial-intelligence-despite-lack-of-parent-awareness-and",
    },
  },
  {
    id: "dpcc-residuos",
    kind: "Proyecto",
    subject: "Desarrollo Personal, Ciudadanía y Cívica",
    level: "3.º de secundaria",
    topic: "Participación ciudadana",
    title: "Menos basura en nuestro colegio",
    original:
      "Elabora una propuesta para reducir la basura en tu colegio. Describe el problema, plantea tres acciones concretas, indica quiénes participan y cómo medirán si la propuesta funcionó.",
    aiAlone: "Un plan genérico con tres acciones razonables que serviría para cualquier colegio del mundo.",
    defense: "Qué datos recogió en su propio colegio, por qué priorizó esa acción y qué hará si sus compañeros no participan.",
  },
  {
    id: "programacion-busqueda-binaria",
    kind: "Ejercicio de código",
    subject: "Programación",
    level: "4.º de secundaria",
    topic: "Búsqueda binaria",
    title: "Búsqueda en una lista ordenada",
    original:
      "Escribe en Python una función que reciba una lista ordenada de números y un valor, y devuelva la posición del valor o -1 si no está. Incluye comentarios y tres casos de prueba.",
    aiAlone: "Código correcto, comentado y con sus tres casos de prueba.",
    defense: "Por qué mueve low a mid + 1 y no a mid, qué pasa con una lista de 2 elementos y qué caso de prueba se le escapó.",
  },
  {
    id: "arte-indigenismo",
    kind: "Análisis de una obra",
    subject: "Arte y Cultura",
    level: "4.º de secundaria",
    topic: "Indigenismo peruano",
    title: "El varayoc de Chinchero",
    original:
      "Analiza la obra «El varayoc de Chinchero» de José Sabogal: describe sus elementos visuales (color, composición, técnica), explica su relación con el movimiento indigenista y expresa tu interpretación personal en una página.",
    aiAlone: "Una descripción formal de la obra y una explicación correcta del indigenismo, sin haberla mirado.",
    defense: "Qué detalle de la pintura le llamó la atención, cómo lo interpreta y qué cambiaría si la obra se pintara hoy en su comunidad.",
  },
];

export const EXAMPLE_SUBJECTS = [...new Set(EXAMPLES.map((e) => e.subject))];

/** The "course" field of the form: subject plus grade. */
export function exampleSubjectLabel(example: Pick<ExampleTask, "subject" | "level">) {
  return `${example.subject}, ${example.level}`;
}

/** Headline figure for the examples section. */
export const HEADLINE_EVIDENCE: Evidence = {
  text: "54% de los alumnos peruanos de 15 años usa chatbots de IA cada semana para estudiar (promedio OCDE: 46%).",
  source: "PISA 2025",
  url: PISA_2025_PERU,
};
