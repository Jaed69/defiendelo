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

### La brecha

La IA generativa ya resuelve la mayoría de las tareas escolares: ensayos, cuestionarios de lectura, problemas, monografías, informes de laboratorio, código. Según PISA 2025, el **54 % de los alumnos peruanos de 15 años usa chatbots de IA cada semana para estudiar** (promedio OCDE: 46 %).

El problema de fondo no es que los alumnos "hagan trampa". Es que **la IA mejora el producto sin mejorar el aprendizaje, y la nota de hoy mide el producto.** Un docente que corrige 150 entregas no puede saber cuánto de cada una entendió el alumno. Las alternativas actuales tampoco sirven:

- **Prohibir la IA o "detectarla"** no funciona: los detectores fallan y castigan a alumnos inocentes.
- **La defensa oral** sí funciona, pero no escala: son de 15 a 20 minutos por alumno.

### Nuestra respuesta

Defiéndelo cambia **qué se evalúa**. La IA está permitida; lo que cuenta es que el alumno pueda **explicar y defender** su propio trabajo.

1. **El docente sube la tarea que ya usa** (PDF, Word o texto). La IA la rediseña: mueve los puntos que una IA puede resolver sola hacia decisiones que el alumno tiene que justificar, y arma una rúbrica nueva.
2. **Prueba de estrés:** la IA resuelve la tarea original y la rediseñada sin ningún alumno detrás. El docente ve cuánta nota saca una IA sola en cada versión.
3. **El alumno entrega su trabajo** (puede usar IA) y recibe **preguntas sobre lo que él mismo entregó**: por qué tomó esas decisiones, qué le dio la IA y qué cambió.
4. **Defensa** en el celular, en papel o en voz alta en clase. La IA sugiere un nivel por criterio y muestra la evidencia.
5. **El docente decide la nota**, ve a quién atender primero y qué errores se repiten en la clase para volver a enseñarlos.

> Principio de diseño: **la IA sugiere, el docente decide.** Coincide con el Reglamento peruano de IA (D.S. 115-2025-PCM), que pide supervisión humana con capacidad de corregir cuando un sistema evalúa a menores de edad, y con la RVM 094-2020-MINEDU, que define la evaluación por competencias como formativa y basada en evidencias.

Además de medir mejor, defender enseña: explicar el propio trabajo activa la autoexplicación, una técnica de estudio con un efecto medio de g = 0,55 en 64 estudios (Bisra et al., 2018).

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
| [Pitch](docs/propuesta/defiendelo-pitch.pptx) | Presentación de la demo. |
| [Educación 2036: oportunidades](docs/investigacion/educacion-2036-oportunidades.md) | Las cuatro grietas del reto y la evidencia detrás de la que elegimos. |
| [Más valor para Defiéndelo](docs/investigacion/mas-valor-para-defiendelo.md) | Evidencia de aprendizaje, carga docente, regulación y caso de negocio. |
| [Diseño](docs/diseno/) | Flujos y pantallas en Pencil. |

Índice completo en [`docs/README.md`](docs/README.md).
