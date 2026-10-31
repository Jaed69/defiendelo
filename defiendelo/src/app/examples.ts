/** A ready-made task a teacher can load into the form, with the reason it needs a redesign. */
export interface ExampleTask {
  id: string;
  subject: string;
  level: string;
  topic: string;
  title: string;
  /** The task as teachers usually hand it out today. */
  original: string;
  /** What an AI can hand in on its own, with no student behind it. */
  aiAlone: string;
  /** What the student would have to explain in the defense after the redesign. */
  defense: string;
}

export const EXAMPLES: ExampleTask[] = [
  {
    id: "matematica-funcion-lineal",
    subject: "Matemática",
    level: "3.º de secundaria",
    topic: "Función lineal",
    title: "El precio de un viaje en mototaxi",
    original:
      "Un mototaxi cobra S/ 3 por subir y S/ 1.50 por cada kilómetro recorrido. Escribe la función que relaciona la distancia con el precio, completa una tabla de 0 a 10 km, haz la gráfica y responde: ¿cuánto cuesta un viaje de 7 km? ¿Cuántos kilómetros puedes recorrer con S/ 15?",
    aiAlone: "La función, la tabla, la gráfica y las dos respuestas salen completas y correctas en segundos.",
    defense: "Por qué la pendiente es 1.50 y no 3, qué cambia en la gráfica si sube la tarifa de subida y cómo lo comprobó con precios reales de su barrio.",
  },
  {
    id: "comunicacion-texto-argumentativo",
    subject: "Comunicación",
    level: "4.º de secundaria",
    topic: "Texto argumentativo",
    title: "¿Celulares en el colegio?",
    original:
      "Escribe un texto argumentativo de 400 palabras sobre si se debería prohibir el uso del celular durante las clases. Incluye una tesis clara, dos argumentos con evidencia, un contraargumento y una conclusión.",
    aiAlone: "Un texto bien estructurado, con tesis, argumentos y conectores correctos, escrito sin ninguna opinión propia del alumno.",
    defense: "Por qué eligió esa tesis, de dónde salió su evidencia y cómo responde en el momento a un contraargumento que no estaba en su texto.",
  },
  {
    id: "ciencia-fotosintesis",
    subject: "Ciencia y Tecnología",
    level: "2.º de secundaria",
    topic: "Fotosíntesis",
    title: "Fotosíntesis en casa",
    original:
      "Explica con tus palabras cómo las plantas transforman la luz en energía química. Incluye un diagrama del cloroplasto, las fases luminosa y oscura, y un experimento casero para comprobar que las plantas liberan oxígeno. Extensión: 2 páginas.",
    aiAlone: "La explicación de las dos fases, la descripción del diagrama y un experimento casero típico.",
    defense: "Qué observó en su propio experimento, qué pasaría si tapa la planta dos días y por qué el resultado no salió como esperaba.",
  },
  {
    id: "sociales-guerra-del-pacifico",
    subject: "Ciencias Sociales",
    level: "5.º de secundaria",
    topic: "Historia del Perú",
    title: "Causas y consecuencias de la Guerra del Pacífico",
    original:
      "Elabora un informe sobre las causas de la Guerra del Pacífico (1879-1884) y sus consecuencias para el Perú. Usa al menos dos fuentes, incluye una línea de tiempo y una conclusión personal.",
    aiAlone: "Un resumen ordenado de causas y consecuencias, una línea de tiempo y una conclusión genérica.",
    defense: "Qué diferencia encontró entre sus dos fuentes, en cuál confía más y por qué, y cómo se ve hoy alguna consecuencia de la guerra en su región.",
  },
  {
    id: "dpcc-residuos",
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
    id: "ingles-pasado-simple",
    subject: "Inglés",
    level: "1.º de secundaria",
    topic: "Simple past",
    title: "My last weekend",
    original:
      "Write an email of 120 words to a friend describing what you did last weekend. Use at least eight verbs in simple past, including four irregular verbs, and ask your friend two questions.",
    aiAlone: "Un correo sin errores, con los verbos irregulares exactos y la extensión pedida.",
    defense: "Responder en inglés preguntas sobre su propio fin de semana y explicar por qué un verbo de su correo es irregular.",
  },
  {
    id: "programacion-busqueda-binaria",
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
    subject: "Arte y Cultura",
    level: "4.º de secundaria",
    topic: "Indigenismo peruano",
    title: "Leer una pintura de José Sabogal",
    original:
      "Elige una pintura de José Sabogal. Describe sus colores, su composición y a los personajes, explica qué fue el indigenismo y cómo se refleja en la obra. Extensión: una página.",
    aiAlone: "Una descripción formal de la obra y una explicación correcta del indigenismo, sin haberla mirado.",
    defense: "Qué detalle de la pintura le llamó la atención, cómo lo interpreta y qué cambiaría si la obra se pintara hoy en su comunidad.",
  },
];

export const EXAMPLE_SUBJECTS = [...new Set(EXAMPLES.map((e) => e.subject))];

/** The "course" field of the form: subject plus grade. */
export function exampleSubjectLabel(example: Pick<ExampleTask, "subject" | "level">) {
  return `${example.subject}, ${example.level}`;
}
