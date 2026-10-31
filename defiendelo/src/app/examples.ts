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

/** A task as a teacher hands it out: one paragraph per block (instruction, parts, criteria, delivery). */
const handout = (...blocks: string[]) => blocks.join("\n\n");

const PISA_2025_PERU ="https://larepublica.pe/sociedad/2026/09/08/peru-retrocede-en-prueba-pisa-2025-y-no-alcanza-niveles-minimos-en-lectura-matematica-y-ciencias-439808";

export const EXAMPLES: ExampleTask[] = [
  {
    id: "comunicacion-texto-argumentativo",
    kind: "Ensayo argumentativo",
    subject: "Comunicación",
    level: "4.º de secundaria",
    topic: "Texto argumentativo",
    title: "¿Celulares en el colegio?",
    original: handout(
      "Consigna: escribe un texto argumentativo de 400 palabras sobre la pregunta: ¿debería prohibirse el uso del celular durante el horario escolar en los colegios del Perú? Plantea una tesis clara, presenta al menos dos argumentos con evidencias y un contraargumento refutado. Cierra con una conclusión que retome tu postura.",
      "Situación: el Consejo Educativo Institucional discutirá en su próxima asamblea una propuesta para regular el uso del celular en el colegio. Los mejores textos se leerán en esa asamblea ante docentes, estudiantes y familias.",
      "Estructura requerida:\n1. Introducción (60 a 80 palabras): presenta el problema y tu tesis en una sola oración.\n2. Primer argumento, con una evidencia (dato, estudio o testimonio) y su fuente.\n3. Segundo argumento, con una evidencia distinta de la primera.\n4. Contraargumento: presenta la postura contraria de forma honesta y refútala.\n5. Conclusión: retoma tu tesis y propone una acción concreta para tu colegio.",
      "Criterios de evaluación (20 puntos):\n- Tesis clara y sostenida en todo el texto: 4 puntos.\n- Argumentos pertinentes y evidencias con fuente: 6 puntos.\n- Contraargumento y refutación: 4 puntos.\n- Coherencia y uso de conectores: 3 puntos.\n- Ortografía y puntuación: 3 puntos.",
      "Formato y entrega: letra Arial 11, interlineado 1,5, máximo una página y media. Escribe al final el número de palabras y la lista de fuentes consultadas. Entrega el viernes en el aula virtual, en PDF.",
    ),
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
    original: handout(
      "Consigna: lee el cuento «Los gallinazos sin plumas» de Julio Ramón Ribeyro y responde: (1) ¿Cuál es el tema central? (2) ¿Qué representa don Santos? (3) Explica el significado del título. Finalmente, redacta un resumen de 150 palabras.",
      "Antes de leer: escribe en dos líneas qué imaginas al leer el título. Al terminar el cuento, compara esa idea con lo que leíste.",
      "Parte A, preguntas (1) a (3): responde cada pregunta en un párrafo de 5 a 8 líneas. Cita en cada respuesta al menos un fragmento del cuento entre comillas, con el número de página.",
      "Parte B, resumen: respeta el orden de los hechos, usa tus propias palabras y no incluyas opiniones. Escribe el número de palabras al final.",
      "Criterios de evaluación (20 puntos):\n- Identifica el tema central: 4 puntos.\n- Interpreta personajes y símbolos con citas del cuento: 6 puntos.\n- Explica el título en relación con la historia: 4 puntos.\n- Resumen fiel y conciso: 4 puntos.\n- Redacción y ortografía: 2 puntos.",
      "Formato y entrega: a mano o en digital, máximo dos páginas. Indica la edición del libro que leíste. Entrega en la próxima clase.",
    ),
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
    original: handout(
      "Consigna: una mototaxi en Juliaca cobra S/ 3 de banderazo más S/ 1,50 por kilómetro. Otra empresa cobra S/ 2,50 por kilómetro sin banderazo. Plantea la función de costo de cada una, determina a partir de qué distancia conviene cada servicio y represéntalo gráficamente.",
      "Lo que debes presentar:\na) Define las variables y escribe la función de costo de cada empresa, con su dominio.\nb) Completa una tabla de valores para 0, 1, 2, 3, 4, 5 y 6 kilómetros.\nc) Resuelve algebraicamente la ecuación en la que ambos costos son iguales e interpreta la solución.\nd) Grafica las dos funciones en el mismo plano cartesiano, con escala, título y leyenda.\ne) Si tienes que ir del terminal terrestre a la plaza de armas (4,2 km), ¿qué servicio eliges y cuánto ahorras?",
      "Criterios de evaluación (20 puntos):\n- Modela la situación con funciones lineales: 5 puntos.\n- Tabla y gráfica correctas y legibles: 5 puntos.\n- Resolución algebraica con procedimiento: 5 puntos.\n- Interpretación de resultados y decisión justificada: 5 puntos.",
      "Formato y entrega: en hoja cuadriculada o en digital. Muestra todo el procedimiento: una respuesta sin procedimiento no suma puntos. Entrega el lunes al iniciar la clase.",
    ),
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
    original: handout(
      "Consigna: elabora una monografía de 4 páginas sobre las causas y consecuencias de la Guerra del Pacífico (1879-1884) para el Perú. Incluye introducción, desarrollo con al menos tres fuentes citadas y conclusiones.",
      "Estructura:\n1. Carátula e índice.\n2. Introducción (media página): tema, objetivo y por qué es importante estudiarlo hoy.\n3. Desarrollo en tres capítulos: antecedentes y causas (el salitre, el Tratado de Alianza Defensiva de 1873, el impuesto de los diez centavos); desarrollo del conflicto (campaña marítima, campaña terrestre, ocupación de Lima y campaña de la Breña); consecuencias para el Perú (territoriales, económicas, sociales y políticas).\n4. Conclusiones: al menos tres, relacionadas con tu objetivo.\n5. Referencias.",
      "Fuentes: usa al menos tres fuentes y una de ellas debe ser un libro o un artículo académico. Cita en formato APA, 7.ª edición. No se aceptan páginas web sin autor.",
      "Criterios de evaluación (20 puntos):\n- Estructura completa: 3 puntos.\n- Causas explicadas con precisión: 4 puntos.\n- Consecuencias analizadas: 4 puntos.\n- Uso y citado de fuentes: 5 puntos.\n- Conclusiones propias: 2 puntos.\n- Redacción y ortografía: 2 puntos.",
      "Formato y entrega: Arial 11, interlineado 1,5, márgenes de 2,5 cm. Las 4 páginas no incluyen carátula, índice ni referencias. Entrega en dos semanas, en PDF, en el aula virtual.",
    ),
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
    original: handout(
      "Consigna: indaga: ¿cómo influye la temperatura del agua en el tiempo de disolución de una pastilla efervescente? Formula tu hipótesis, identifica las variables, registra tus datos en una tabla con tres repeticiones y elabora un gráfico. Redacta el informe con discusión y conclusiones.",
      "Materiales: 9 pastillas efervescentes de la misma marca, 3 vasos transparentes, agua a tres temperaturas (fría, cerca de 10 °C; ambiente, cerca de 20 °C; tibia, cerca de 40 °C), un termómetro, un cronómetro o celular y una jarra medidora.",
      "Procedimiento sugerido:\n1. Mide 200 mL de agua en cada vaso.\n2. Registra la temperatura exacta del agua.\n3. Deja caer la pastilla e inicia el cronómetro.\n4. Detén el cronómetro cuando no quede ningún resto sólido.\n5. Repite tres veces con cada temperatura.",
      "El informe debe incluir: pregunta de indagación; hipótesis (si..., entonces...); variables independiente, dependiente y controladas; tabla con las tres repeticiones y el promedio; gráfico; discusión (compara con tu hipótesis y explica las fuentes de error) y conclusiones.",
      "Criterios de evaluación (20 puntos):\n- Hipótesis y variables: 4 puntos.\n- Registro de datos: 5 puntos.\n- Gráfico: 3 puntos.\n- Discusión de resultados y errores: 5 puntos.\n- Conclusiones: 3 puntos.",
      "Seguridad: usa agua tibia, nunca hirviendo, y trabaja con la supervisión de un adulto. Entrega el informe en una semana.",
    ),
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
    original: handout(
      "Task: write an email (120-150 words) to a pen pal from Canada describing a traditional festival from your region, such as Inti Raymi or the Fiesta de la Candelaria. Use the simple present and at least five time expressions.",
      "Your email must include:\n1. A greeting and a short introduction about yourself.\n2. The name of the festival, and where and when people celebrate it.\n3. Three things people do during the festival: food, music, dances or clothes.\n4. What you and your family usually do that day.\n5. A question for your pen pal and a farewell.",
      "Language checklist: the simple present in affirmative, negative and question forms; at least five time expressions (every year, in June, usually, always, on the first day); at least three connectors (and, but, because).",
      "Assessment criteria (20 points):\n- Content and organization: 6 points.\n- Simple present: 6 points.\n- Time expressions and vocabulary: 4 points.\n- Spelling and punctuation: 4 points.",
      "Format and deadline: typed, 120-150 words. Write the word count at the end. Send it next Monday through the virtual classroom.",
    ),
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
    original: handout(
      "Consigna: elabora una propuesta para reducir la basura en tu colegio. Describe el problema, plantea tres acciones concretas, indica quiénes participan y cómo medirán si la propuesta funcionó.",
      "Trabajo en equipos de cuatro integrantes. Cada equipo elige un espacio del colegio: patio, quiosco, aulas o baños.",
      "Etapas:\n1. Diagnóstico: durante una semana, registra en una tabla qué tipo de residuos se generan en ese espacio y dónde se acumulan.\n2. Problema: redacta en un párrafo el problema principal y sus causas.\n3. Acciones: para cada una de las tres acciones, indica qué se hará, quién es responsable, qué materiales se necesitan y en qué fechas.\n4. Participantes: estudiantes, docentes, personal de limpieza o familias, y el rol de cada uno.\n5. Indicadores: cómo medirán el resultado, por ejemplo, kilos de residuos por semana antes y después.\n6. Presentación: exposición de 5 minutos ante el aula.",
      "Criterios de evaluación (20 puntos):\n- Diagnóstico con datos propios: 5 puntos.\n- Acciones viables y concretas: 5 puntos.\n- Participantes y roles: 3 puntos.\n- Indicadores medibles: 4 puntos.\n- Presentación oral: 3 puntos.",
      "Formato y entrega: documento de máximo tres páginas, con la tabla del diagnóstico como anexo. Exposición en dos semanas.",
    ),
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
    original: handout(
      "Consigna: escribe en Python una función que reciba una lista ordenada de números y un valor, y devuelva la posición del valor o -1 si no está. Incluye comentarios y tres casos de prueba.",
      "Requisitos:\n1. La función se llama busqueda_binaria(lista, valor).\n2. Usa el algoritmo de búsqueda binaria: no se permite usar el operador in ni el método index().\n3. No modifiques la lista que recibes.\n4. Comenta cada paso del algoritmo con tus palabras.\n5. Escribe los tres casos de prueba con assert: un valor que está en la lista, un valor que no está y una lista vacía.",
      "Pregunta adicional: explica en un párrafo por qué la búsqueda binaria es más rápida que revisar la lista elemento por elemento cuando la lista tiene 1000 números.",
      "Criterios de evaluación (20 puntos):\n- La función devuelve el resultado correcto: 8 puntos.\n- Usa el algoritmo de búsqueda binaria: 4 puntos.\n- Casos de prueba: 4 puntos.\n- Comentarios y explicación: 4 puntos.",
      "Formato y entrega: un archivo .py que se ejecute sin errores. Entrega el jueves en el aula virtual.",
    ),
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
    original: handout(
      "Consigna: analiza la obra «El varayoc de Chinchero» de José Sabogal: describe sus elementos visuales (color, composición, técnica), explica su relación con el movimiento indigenista y expresa tu interpretación personal en una página.",
      "Guía de análisis:\n1. Ficha técnica: autor, año, técnica, dimensiones y museo donde se encuentra. Investiga cada dato y anota la fuente.\n2. Descripción: el personaje, su vestimenta, los objetos que lleva y el fondo.\n3. Análisis formal: color (paleta y contrastes), composición (ubicación de la figura, líneas y encuadre) y técnica (pincelada y textura).\n4. Contexto: el indigenismo en el Perú de inicios del siglo XX, el papel de Sabogal y la figura del varayoc como autoridad de la comunidad.\n5. Interpretación personal: qué transmite la obra, qué sentiste al verla y qué preguntas te deja.",
      "Criterios de evaluación (20 puntos):\n- Descripción y análisis formal: 6 puntos.\n- Relación con el indigenismo: 5 puntos.\n- Interpretación personal fundamentada: 6 puntos.\n- Redacción: 3 puntos.",
      "Formato y entrega: una página, Arial 11. Incluye una imagen de la obra con su fuente. Entrega la próxima semana.",
    ),
    aiAlone: "Una descripción formal de la obra y una explicación correcta del indigenismo, sin haberla mirado.",
    defense: "Qué detalle de la pintura le llamó la atención, cómo lo interpreta y qué cambiaría si la obra se pintara hoy en su comunidad.",
  },
];

export const EXAMPLE_SUBJECTS = [...new Set(EXAMPLES.map((e) => e.subject))];

/** The "course" field of the form: subject plus grade. */
export function exampleSubjectLabel(example: Pick<ExampleTask, "subject" | "level">) {
  return `${example.subject}, ${example.level}`;
}

/** The example as the PDF a teacher would upload; built by `npm run examples:pdf` into public/ejemplos. */
export function examplePdf(example: Pick<ExampleTask, "id">) {
  const name = `${example.id}.pdf`;
  return { name, href: `/ejemplos/${name}` };
}

/** Headline figure for the examples section. */
export const HEADLINE_EVIDENCE: Evidence = {
  text: "54% de los alumnos peruanos de 15 años usa chatbots de IA cada semana para estudiar (promedio OCDE: 46%).",
  source: "PISA 2025",
  url: PISA_2025_PERU,
};
