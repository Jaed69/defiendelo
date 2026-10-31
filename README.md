# Defiéndelo

**Tareas que los alumnos pueden resolver con IA, calificadas por lo que saben explicar.**

Proyecto para **DSC HACK 2026 · Educación 2036**.

🔗 **Demo:** https://defiendelo.vercel.app · 📄 **Propuesta:** [`docs/propuesta/`](docs/propuesta/) · 🔬 **Investigación:** [`docs/investigacion/`](docs/investigacion/)

## 🗂️ Estructura del repositorio

```
.
├── defiendelo/              Aplicación web (Next.js): código, tests y scripts
│   ├── src/                 Dominio, puertos, adaptadores, casos de uso y pantallas
│   ├── public/ejemplos/     PDF de las tareas de ejemplo
│   └── README.md            Detalle técnico de la aplicación
└── docs/                    Documentación del proyecto
    ├── propuesta/           Propuesta enviada al hackathon y presentación del pitch
    ├── investigacion/       Informes con la evidencia que sustenta el problema y la solución
    ├── diseno/              Diseño de las pantallas (Pencil) y capturas
    └── flujo-sintetico/     Datos para probar el flujo completo a mano
```

---

## 🎯 Problema y solución

### La brecha: la IA mejora la tarea y empeora el aprendizaje

De las cuatro grietas del reto, elegimos la **02**. La IA generativa ya resuelve la mayoría de las tareas escolares: ensayos, cuestionarios de lectura, problemas, monografías, informes de laboratorio, código. Según PISA 2025, el **54 % de los alumnos peruanos de 15 años usa chatbots de IA cada semana para estudiar** (promedio OCDE: 46 %; [La República](https://larepublica.pe/sociedad/2026/09/08/peru-retrocede-en-prueba-pisa-2025-y-no-alcanza-niveles-minimos-en-lectura-matematica-y-ciencias-439808)).

El problema de fondo no es que los alumnos "hagan trampa". Es que **la IA mejora el producto sin mejorar el aprendizaje, y la nota de hoy mide el producto.**

| Evidencia | Qué muestra |
| --- | --- |
| Bastani et al., *PNAS* 2025 (~1.000 escolares) | Con IA, la práctica mejoró 48 %; al retirarla, ese grupo rindió **17 % menos** que quienes nunca la usaron. Con salvaguardas pedagógicas, el daño se mitigó. ([Wharton](https://knowledge.wharton.upenn.edu/article/without-guardrails-generative-ai-can-harm-education/)) |
| Fan et al., 2024 (117 universitarios) | El grupo con ChatGPT **mejoró más la nota del ensayo**, pero **no difirió** en conocimiento ni en transferencia. ([arXiv](https://arxiv.org/abs/2412.09315v1)) |
| Anthropic Education Report, 2025 | En ~47 % de las conversaciones el estudiante pide la respuesta directa; la IA hace sobre todo las tareas de **crear** y **analizar**. ([Anthropic](https://www.anthropic.com/research/anthropic-education-report-how-university-students-use-claude)) |

Un docente que corrige 150 entregas no puede saber cuánto de cada una entendió el alumno. Las alternativas actuales no cierran la brecha:

- **Prohibir la IA o "detectarla"**: los detectores no prueban comprensión y convierten la evaluación en una acusación.
- **Los modos de estudio de los chatbots**: el alumno los apaga con un clic y al docente no le llega nada.
- **La defensa oral** sí funciona, pero no escala: la literatura trabaja con 15 a 20 minutos por alumno ([CAUSE](https://www.causeweb.org/cause/node/26215)). Y hacia 2036 habrá menos docentes: **1 de cada 5 docentes de secundaria tiene 55 años o más** ([Gestión](https://gestion.pe/economia/peru-1-de-cada-5-profesores-de-secundaria-tiene-55-anos-hay-personal-listo-para-el-relevo-noticia/)).

Nuestra conclusión, a partir de la [investigación](docs/investigacion/): **la solución tiene que vivir en la evaluación y en el flujo del docente, no ser otro tutor más.**

### Nuestra respuesta

Defiéndelo cambia **qué se evalúa**. La IA está permitida; lo que cuenta es que el alumno pueda **explicar y defender** su propio trabajo.

1. **El docente sube la tarea que ya usa** (PDF, Word o texto). La IA la rediseña: mueve los puntos que una IA puede resolver sola hacia decisiones que el alumno tiene que justificar, y arma una rúbrica nueva.
2. **Prueba de estrés:** la IA resuelve la tarea original y la rediseñada sin ningún alumno detrás. El docente ve cuánta nota saca una IA sola en cada versión.
3. **El alumno entrega su trabajo** (puede usar IA) y recibe **preguntas sobre lo que él mismo entregó**: por qué tomó esas decisiones, qué le dio la IA y qué cambió.
4. **Defensa** en el celular, en papel o en voz alta en clase. La IA sugiere un nivel por criterio y muestra la evidencia.
5. **El docente decide la nota**, ve a quién atender primero y qué errores se repiten en la clase para volver a enseñarlos.

> Principio de diseño: **la IA sugiere, el docente decide.** El Reglamento peruano de IA (D.S. 115-2025-PCM, art. 24.1 b) considera de riesgo alto la evaluación de aprendizajes de menores, *salvo que el sistema sea complementario y no reemplace la evaluación pedagógica humana*: Defiéndelo está diseñado para quedar en ese caso. También coincide con la RVM 094-2020-MINEDU, que define la conclusión descriptiva como un juicio docente basado en evidencias.

Además de medir mejor, defender enseña: explicar el propio trabajo activa la autoexplicación, una técnica de estudio con un efecto medio de g = 0,55 en 64 estudios, alrededor de medio desvío estándar (Bisra et al., 2018; [BPS](https://bps.org.uk/research-digest/self-explanation-powerful-learning-technique-according-meta-analysis-64-studies)). Las preguntas abiertas sobre el contenido propio son la variante de mayor efecto.

---

## 💡 Por qué es diferente

Ninguna de las alternativas revisadas combina el rediseño previo de la tarea, la prueba contra la IA y una defensa que no depende de la voz ni de un dispositivo por alumno.

| Alternativa | Ejemplos | Qué le falta |
| --- | --- | --- |
| Detectores de IA | GPTZero, Turnitin | Vigilan, no comprueban comprensión, y generan acusaciones. |
| Modos de estudio | Modo estudio de ChatGPT, Guided Learning de Google | Son opcionales para el alumno y no le llega nada al docente. |
| Asistentes docentes gratuitos | Khanmigo, Gemini for Education, MagicSchool | Generan material, pero no prueban la tarea contra la IA ni miden comprensión. |
| Exámenes orales con IA | Rocketproof, Socratic Mind, el piloto de NYU Stern | Por voz, uno a uno, en inglés y pensados para la universidad. |

Lo propio de Defiéndelo:

- **No detecta IA ni da respuestas: pregunta.** Las preguntas salen del trabajo que entregó cada alumno.
- **Prueba de estrés:** el docente ve cuánta nota saca una IA sola, antes y después del rediseño.
- **Tres formas de defender:** en el celular, en papel o en voz alta. Funciona sin un dispositivo por alumno y no procesa voz, rostro ni emociones.
- **Hecho para el aula peruana:** escala AD · A · B · C o vigesimal, en español, y orientado a competencias.
- **Cierra el ciclo:** agrupa los errores repetidos de la clase y propone una actividad corta para cada uno.

---

## ⚙️ Arquitectura y tecnologías

### Stack

| Capa | Tecnología |
| --- | --- |
| Framework | **Next.js 15** (App Router) + **React 19** + **TypeScript** |
| Estilos | **Tailwind CSS 4** con tokens de diseño propios |
| IA | **Claude API** (`claude-opus-5-5`) vía `@anthropic-ai/sdk`, u **OpenRouter** como alternativa |
| Validación | **Zod** en todas las rutas de la API |
| Persistencia | **Upstash Redis** en producción; memoria del proceso en local |
| Lectura de documentos | **pdfjs-dist** (PDF) y **mammoth** (Word), en el navegador |
| Tests | **Vitest** |
| Despliegue | **Vercel** (Fluid Compute) |

### Componentes (arquitectura hexagonal)

```
defiendelo/src/
├── domain/        Tipos y lógica pura: brecha IA-alumno, notas, triaje, sesiones de clase
├── ports/         Interfaces: AssessmentAI (la IA) y AssignmentStore (el almacenamiento)
├── adapters/      Claude, OpenRouter, demo sin IA, memoria y Upstash
├── application/   Casos de uso; las rutas de la API solo los llaman
├── demo/          Clases sintéticas ya evaluadas para cada tarea de ejemplo
└── app/           Pantallas (docente, alumno, entrar) y rutas de la API
```

### Decisiones técnicas

- **Puertos y adaptadores.** La lógica de evaluación no conoce al proveedor de IA ni la base de datos. Cambiar Claude por OpenRouter, o la memoria por Redis, es cambiar un adaptador.
- **Modo demo sin clave de IA.** Sin `ANTHROPIC_API_KEY` ni `OPENROUTER_API_KEY`, la app responde con datos deterministas: todo el flujo funciona sin conexión y sin costo.
- **Ejemplos precargados.** Las 9 tareas de ejemplo ya pasaron por el pipeline real de IA. Sus resultados están guardados, así que la demo responde al instante y nunca espera a un modelo. Cada ejemplo trae además su **PDF** (`public/ejemplos/`), como el que subiría un docente.
- **Los documentos se leen en el navegador.** El archivo del docente o del alumno nunca se sube al servidor; solo viaja su texto.
- **Privacidad por diseño.** Los alumnos usan un alias y una cuenta por código (`ALUM-…`, `PROFE-…`). No se guardan datos personales, audio ni video. El panel docente exige la clave del docente.
- **Respaldo ante rechazos.** Si el modelo principal rechaza una respuesta, un adaptador de respaldo reintenta del lado del servidor.

---

## 🔗 Demo desplegada

**https://defiendelo.vercel.app**

### Cómo probarla en 2 minutos

1. **Como docente:** en la portada, elige una tarea de ejemplo (por ejemplo, *Monografía · Ciencias Sociales 5.º*). Se carga su PDF y su texto. Pulsa **Rediseñar la tarea**.
2. Revisa la **tarea rediseñada**, la **prueba de estrés** (cuánta nota saca una IA sola) y edita lo que quieras. Copia el **código o enlace para alumnos**.
3. **Como alumno:** abre ese enlace en otra ventana o en el celular, entra con un alias y entrega un trabajo. En los ejemplos puedes cargar un trabajo sintético con un clic.
4. Responde las **preguntas de defensa** sobre tu propio trabajo.
5. **De vuelta como docente:** en **Entregas** verás el orden sugerido para atender a cada alumno, la nota sugerida por criterio con su evidencia y los malentendidos repetidos de la clase. Ajusta y **publica las notas**.

También puedes subir **tu propia tarea** en PDF o Word: en ese caso pasa por la IA real y tarda menos de un minuto.

---

## ✅ Funcionalidades implementadas

### Qué funciona

**Docente**
- Subir una tarea en PDF, Word o texto, o elegir uno de los 9 ejemplos de 8 cursos (con su PDF precargado).
- Rediseño con IA: consigna nueva, política de uso de IA y rúbrica que separa lo que se ve en la entrega y lo que se ve en la defensa.
- Prueba de estrés: la IA resuelve la tarea original y la rediseñada, y compara las notas.
- Editor de la tarea rediseñada y hoja de tarea lista para imprimir.
- Configuración de la evaluación: modo de defensa (celular, papel u oral en clase), nota máxima y nota para aprobar, cierre de entregas.
- Panel de entregas: orden sugerido de atención, revisión por alumno con nivel sugerido por criterio y su evidencia, nota final decidida por el docente, retroalimentación y publicación.
- Malentendidos de la clase agrupados, con una actividad corta para cada uno.
- Cuenta por código para volver a sus tareas desde otro dispositivo.

**Alumno**
- Entrar con un alias y un código, sin datos personales.
- Entregar el trabajo (archivo o texto) y reemplazarlo hasta que cierren las entregas.
- Preguntas de defensa generadas a partir de su propio trabajo.
- Defensa escrita en el celular, en papel o en clase cuando el docente lo llama.
- Resultado con "cómo se calculó tu nota", criterio por criterio, una vez que el docente publica.

### Limitaciones actuales

- **La defensa oral no se graba ni se transcribe:** el docente la conduce en clase y registra la nota. La app no procesa voz, emociones ni rostro, por diseño.
- **No detecta si un alumno usó IA.** No es su objetivo: mide comprensión, no vigilancia.
- **La nota sugerida puede equivocarse.** Siempre la revisa y decide el docente.
- **Sin integración con plataformas escolares** (SIAGIE, Google Classroom, Moodle) ni inicio de sesión institucional; las cuentas son por código.
- **PDF escaneados:** solo se lee texto seleccionable; un PDF que es una imagen debe copiarse a mano.
- **Tiempos de la IA real:** el rediseño tarda menos de un minuto, y la prueba de estrés de 1 a 3 minutos con modelos pequeños. Los ejemplos responden al instante.
- **Los datos de los ejemplos son sintéticos:** alumnos inventados, sin datos reales.
- Pensado y probado para **secundaria en Perú**, en español (más Inglés como curso).

---

## 📈 Caso de negocio y sostenibilidad

- **Gratis para el docente, la institución paga por evidencia.** Los asistentes docentes ya son gratuitos (Khanmigo, Gemini for Education), así que no competimos como "otro asistente". El colegio o la universidad paga por evidencia documentada de comprensión, del presupuesto que hoy destina a integridad académica: Turnitin cobra entre USD 1,79 y 6,50 por alumno al año en contratos públicos de California ([Sacra](https://sacra.com/c/turnitin/); no hay dato latinoamericano público).
- **Costo de operación muy bajo.** Estimamos que una defensa cuesta **menos de medio centavo de dólar** en IA (≈ USD 0,0013 con Gemini 2.5 Flash-Lite). Los precios del modelo están verificados; los tokens por defensa son una estimación propia que mediremos en el piloto.
- **Ruta de adopción:**
  1. **0 a 6 meses:** docentes individuales, gratis con un límite mensual.
  2. **6 a 18 meses:** colegios privados y facultades, cuando 3 o más docentes de la misma institución lo usan. Licencia por alumno al año, por debajo de lo que hoy cuesta un detector.
  3. **18 meses en adelante:** sector público (pilotos con UGEL), financiado por fondos de innovación o cooperación.
- **Canal:** los docentes inscritos en los cursos de IA del Minedu y PerúEduca.

Análisis completo, con supuestos y riesgos, en [Más valor para Defiéndelo](docs/investigacion/mas-valor-para-defiendelo.md).

---

## 🧪 Validación con usuarios

**Estado:** el MVP está desplegado y probado con datos sintéticos (9 tareas de 8 cursos, con clases simuladas que ya pasaron por el pipeline real de IA). Todavía **no tenemos resultados con docentes ni alumnos reales**.

Plan de validación (sin menores de edad):

- **Con quién:** 1 o 2 docentes universitarios, 1 docente novel y de 5 a 10 estudiantes.
- **Guion para el docente:** ¿Cómo sabes hoy quién entendió y quién solo entregó? ¿Cuánto tiempo te toma? ¿Qué parte de esto usarías mañana?
- **Qué medimos:** la brecha entre lo entregado y lo explicado, el porcentaje de sugerencias de la IA que el docente cambia, el tiempo de revisión y si la IA sola saca menos de la mitad de la nota en la tarea rediseñada.

---

## 📖 Instrucciones de ejecución

Requisitos: **Node.js 20 o superior** y npm.

```bash
cd defiendelo
npm install
npm run dev
```

Abre http://localhost:3000. **Sin claves de IA funciona en modo demo**, con respuestas deterministas.

### Variables de entorno (opcionales)

Crea `defiendelo/.env.local` (está en `.gitignore`):

| Variable | Para qué |
| --- | --- |
| `ANTHROPIC_API_KEY` | Usar Claude (`claude-opus-5-5`). Tiene prioridad. |
| `OPENROUTER_API_KEY` | Usar OpenRouter si no hay clave de Anthropic. |
| `OPENROUTER_MODEL` | Modelo de OpenRouter (por defecto `z-ai/glm-5.3-flash`). |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Almacenamiento compartido en producción. También acepta `KV_REST_API_URL` / `KV_REST_API_TOKEN`. |

Sin Upstash, los datos viven en la memoria del proceso: sirve para desarrollo, no para varias instancias en Vercel.

### Otros comandos

```bash
npm test               # tests con Vitest
npm run lint           # ESLint
npm run build          # build de producción
npm run examples:pdf   # regenera los PDF de ejemplo (requiere Python con reportlab)
```

### Desplegar en Vercel

1. Importa el repositorio y define **Root Directory** = `defiendelo`.
2. Agrega la integración de **Upstash Redis** y una clave de IA (`ANTHROPIC_API_KEY` u `OPENROUTER_API_KEY`).
3. Despliega. La prueba de estrés usa `maxDuration` de 300 s (requiere Fluid Compute).

Más detalle técnico en [`defiendelo/README.md`](defiendelo/README.md). Para recorrer el flujo completo a mano con tres alumnos de prueba, sigue [`docs/flujo-sintetico/`](docs/flujo-sintetico/).

---

## 📚 Documentación

| Documento | Qué contiene |
| --- | --- |
| [Propuesta DSC HACK 2026](docs/propuesta/propuesta-dsc-hack-2026.pdf) | La propuesta presentada al reto. |
| [Pitch para el jurado](docs/propuesta/defiendelo-pitch-jurado.pptx) | 3 minutos con el Círculo de Oro (por qué, cómo, qué) y guion en las notas. |
| [Recorrido de la demo](docs/propuesta/defiendelo-pitch.pptx) | Capturas paso a paso de la aplicación. |
| [Educación 2036: oportunidades](docs/investigacion/educacion-2036-oportunidades.md) | Las cuatro grietas del reto y la evidencia detrás de la que elegimos. |
| [Más valor para Defiéndelo](docs/investigacion/mas-valor-para-defiendelo.md) | Evidencia de aprendizaje, carga docente, regulación y caso de negocio. |
| [Diseño](docs/diseno/) | Flujos y pantallas en Pencil. |

Índice completo en [`docs/README.md`](docs/README.md).
