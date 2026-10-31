# Deep dive G2 — "Defiéndelo + Proceso Visible"

DSC HACK 2026 (PUCP) · Educación 2036 · Grieta 02: aprender sin pensar.
Investigación: 2026-10-30. Leyenda: **[V]** verificado en fuente primaria o en varias fuentes coincidentes · **[S]** solo fuente secundaria · **[NV]** no verificado / de memoria, confirmar antes de citar.

---

## 0. Tesis en una línea

Si el estudiante puede usar IA para producir, la evaluación debe moverse de *qué entregó* a *qué puede explicar de lo que entregó*. La ciencia del aprendizaje dice que explicar en voz propia (self-explanation, retrieval, generación) **es** aprendizaje, no solo medición; y el sector universitario internacional ya se está moviendo hacia evaluaciones orales/interactivas por GenAI. El hueco: hacerlo **escalable, personalizado a la entrega concreta, en español, y con un mapa de brechas para el docente**.

---

## 1. Evidencia: explicar / oralidad / recuperación

### 1.1 Efectos cognitivos base
| Efecto | Dato | Fuente | Estado |
|---|---|---|---|
| Self-explanation (meta-análisis) | 69 tamaños de efecto, 64 reportes, ~5.900 aprendices; **g = 0,55** (efectos aleatorios) | Bisra, Liu, Nesbit, Salimi & Winne (2018), *Educational Psychology Review* — https://www.gwern.net/doc/psychology/spaced-repetition/2018-bisra.pdf · resumen BPS: https://bps.org.uk/research-digest/self-explanation-powerful-learning-technique-according-meta-analysis-64-studies | [V] |
| Self-explanation original | Chi et al. 1989 (*Cognitive Science*): "buenos" estudiantes generan más autoexplicaciones; Chi et al. 1994: inducir autoexplicación mejora comprensión (circulatorio) | Clásicos | [NV] (no re-verificado hoy; citas canónicas) |
| Testing effect | Retención a 1 semana mejor con test que con re-estudio; a 5 min se invierte. Exp. 1 ≈ **56% (estudio-test) vs 42% (estudio-estudio)** a 1 semana | Roediger & Karpicke (2006), *Psychological Science* 17(3):249-255 — https://psychology.ecu.edu/wp-content/pv-uploads/sites/216/2019/03/Roediger-Karpicke-2006.pdf | Dirección [V]; porcentajes [NV] (de memoria, confirmar en Fig. 1) |
| Protégé effect | Estudiantes se esfuerzan más aprendiendo para enseñarle a un agente (Betty's Brain) que para sí mismos | Chase, Chin, Oppezzo & Schwartz (2009), *J. Sci. Educ. Technol.* 18(4):334-352 — https://purl.stanford.edu/zm369yx3532 | [V] |
| Generation effect | Generar información > leerla (Slamecka & Graf 1978; meta-análisis Bertsch et al. 2007, d≈0,40) | Clásicos | [NV] |

**Implicancia de diseño:** el "explain-back" no es sólo un control de integridad; es una intervención con efecto medio (g≈0,55). Esto permite venderlo como *pedagogía*, no como *vigilancia*.

### 1.2 Oral vs escrito
- **Huxham, Campbell & Westwood (2012)**, *Assessment & Evaluation in Higher Education* 37(1):125-136 (online 2010, DOI 10.1080/02602938.2010.515012). Dos cohortes; estudiantes más nerviosos ante el oral pero muchos lo consideran más útil; autores concluyen que el oral puede ser **más inclusivo** y construye identidad profesional. Diseño reportado en secundarios como comparación aleatoria con mejor desempeño en oral — **[NV]** las cifras de desempeño; ver https://napier-repository.worktribe.com/output/436445/oral-versus-written-assessments-a-test-of-student-performance-and-attitudes [V parcial].
- **Adelaide, bioscience IOA (2025)**: 722 estudiantes, 2009–2023. Mejoras significativas en evaluación final y nota del curso tras introducir IOA; **sin diferencias por género, estatus internacional o idioma**; la ansiedad reportada **no afectó el desempeño**; formato resiliente al mal uso de GenAI — https://digital.library.adelaide.edu.au/items/d630c8c4-ff11-43de-a8a2-810dbf59a4b8 [S/V abstract].
- Iannone & Simpson (2015, matemáticas): pese a ansiedad, estudiantes ven el oral como foco en comprensión — https://research-portal.uea.ac.uk/en/publications/students-views-of-oral-performance-assessment-in-mathematics-stra [S].

### 1.3 Universidades/reguladores que giran a oral/interactivo por GenAI
| Actor | Qué | Fecha | Fuente |
|---|---|---|---|
| TEQSA (Australia) | *Assessment reform for the age of artificial intelligence* (principios, "brújula") | Nov 2023 [NV mes] | citado en el doc 2025 |
| TEQSA | *Enacting assessment reform in a time of AI* ("mapa"): seguridad en puntos significativos del programa, reforma a nivel de programa; guía, no expectativa regulatoria | **Sep 2025** | https://www.teqsa.gov.au/sites/default/files/2025-09/enacting-assessment-reform-in-a-time-of-artificial-intelligence.pdf [V] |
| U. of Sydney | "Two-lane approach": Lane 1 = evaluación segura/presencial *de* aprendizaje (nivel programa); Lane 2 = abierta *para/como* aprendizaje (IA permitida). Embebido en políticas de evaluación e integridad; IOA definidas como "secure assessments" | Anunciado 2024; vigente desde S1 2025 [S] | FAQ: https://educational-innovation.sydney.edu.au/teaching@sydney/?p=21264 · Tareas 2025-26: https://educational-innovation.sydney.edu.au/teaching@sydney/?p=24402 · Mitos IOA: https://educational-innovation.sydney.edu.au/teaching@sydney/five-myths-about-interactive-oral-assessments-and-how-to-get-started/ |
| UCL | Toolkit "Making oral assessments inclusive": múltiples examinadores, grabar, diseño cuidadoso por ansiedad/sesgo | May 2026 | https://www.ucl.ac.uk/teaching-learning/publications/2026/may/making-oral-assessments-inclusive [S] |
| U. Bayreuth | ExamSim: avatar IA examinador, piloto WS 2024/25 | Feb 2025 | https://www.zhl.uni-bayreuth.de/de/news/2025/250228_examsim_en/index.html [S] |
| TU Eindhoven | EXAMAI: examen oral asistido por IA | 2024–25 | https://drive.tue.nl/projects/ai-assisted-examination-examai/ [S] |
| Macquarie | iViva: vivas con IA conversacional | — | https://researchers.mq.edu.au/en/projects/iviva-enhancing-viva-assessments-with-conversational-ai/ [S] |

**Pitch:** Sydney/TEQSA validan el modelo "Lane 2 abierta + verificación de comprensión". Defiéndelo = Lane 1 *ligera y escalable* aplicada sobre trabajos Lane 2.

---

## 2. Evidencia: IA sin restricción daña el aprendizaje

- **Bastani et al. (2025), PNAS 122(26), e2422633122** — ~1.000 estudiantes de secundaria (Turquía), matemáticas. Durante práctica: **+48%** (GPT Base) y **+127%** (GPT Tutor) vs control. En examen sin IA: GPT Base **−17%** vs control; GPT Tutor (con guardrails pedagógicos) mitiga el daño (~neutro). Mecanismo: la mayoría con GPT Base pedía la respuesta directa. https://ideas.repec.org/a/nas/journl/v122y2025pe2422633122.html · SSRN: https://papers.ssrn.com/abstract=4895486 · Wharton: https://knowledge.wharton.upenn.edu/article/without-guardrails-generative-ai-can-harm-education [V]
- **Kosmyna et al. (MIT Media Lab, jun 2025)**, "Your Brain on ChatGPT", arXiv 2506.08872, **preprint sin revisión por pares**, n=54, EEG. Grupo LLM: menor conectividad; **~83% no pudo citar una frase de su propio ensayo** minutos después (vs ~11% en grupos Search/Brain-only). Cifras varían entre secundarios; autores piden tratarlo como preliminar. https://www.brainonllm.com/ · https://www.media.mit.edu/projects/your-brain-on-chatgpt/overview/ [S — confirmar número exacto en el paper]. **Argumento directo para Defiéndelo:** "no puede citar su propio texto" es exactamente la brecha que medimos.
- **Anthropic Education Report (8 abr 2025)** — 1M conversaciones de cuentas con email universitario → 574.740 académicas (Clio). **~47% "directas"** (buscan respuesta/contenido con poca interacción). Cuatro patrones de 23–29% cada uno. CS sobrerrepresentado (36,8% vs 5,4% de títulos). Cuentas pueden incluir staff. https://anthropic.com/news/anthropic-education-report-how-university-students-use-claude [V]
- **Brookings Global Task Force on AI in Education (14 ene 2026)**, *A New Direction for Students in an AI World: Prosper, Prepare, Protect*. Conclusión: hoy **los riesgos superan a los beneficios**, pero son corregibles. Riesgo #1: desarrollo cognitivo (offloading). Recomendaciones: IA menos complaciente y más desafiante, alfabetización IA para docentes/estudiantes, alejar la escuela de la "completación transaccional de tareas"/fin centrado en la nota; marco Prosper/Prepare/Protect. https://www.brookings.edu/projects/brookings-global-task-force-on-ai-in-education · NPR: https://www.npr.org/2026/01/14/nx-s1-5674741/ai-schools-education [S — no leí el PDF completo]

---

## 3. Productos existentes y qué les falta

| Producto | Qué hace | Precio | Qué le falta vs Defiéndelo |
|---|---|---|---|
| **Turnitin Clarity** (anunciado SXSW EDU mar 2025, GA jul 2025) | Espacio de composición dentro de Feedback Studio; playback del proceso (pegados, tiempo, historial); asistente IA opcional activado por docente; **no es detector** | Add-on pagado de Feedback Studio (sin precio público) | Muestra *proceso*, no *comprensión*; asistente solo inglés; no interroga al estudiante sobre su entrega. https://www.plagiarismtoday.com/2025/03/06/turnitin-announces-clarity-aim-to-make-student-writing-more-transparent/ · https://latam.turnitin.com/press/turnitin-launches-turnitin-clarity-bringing-transparency-and-integrity-insights-to-education [V] |
| **GPTZero** | Detector + "writing replay" en Google Docs; acuerdo con AFT (1,7M docentes) | Free 10k palabras/mes; pagos ~$10–15/mes [S]; institucional ~$2k–30k/año [S estimado] | Detector probabilístico (falsos positivos, adversarial); no evalúa comprensión. https://sacra.com/c/gptzero/ |
| **Grammarly Authorship** | Replay de cómo se escribió (escrito, pegado, IA) para que el estudiante "demuestre" autoría | En Grammarly for Education; precio edu no público ($165,99 group license en reseller [S]) | Prueba de proceso, no de comprensión; el estudiante puede tipear lo que la IA dictó. https://www.grammarly.com/edu |
| **Khanmigo** | Tutor socrático; Khanmigo for Teachers gratis (EE.UU., luego 180+ países vía Microsoft) | Teachers gratis; estudiantes solo vía distrito | K-12, centrado en tutoría, no en defensa de entregas propias. https://blog.khanacademy.org/?p=16634 [V] |
| **OpenAI Study Mode** (29 jul 2025) | ChatGPT guía en vez de responder; gratis | Gratis | Opt-in; el estudiante lo desactiva con un clic; no da evidencia al docente. https://techcrunch.com/2025/08/06/google-takes-on-chatgpts-study-mode-with-new-guided-learning-tool-in-gemini/ [V] |
| **Gemini Guided Learning / LearnLM** (6 ago 2025) | Tutor paso a paso con LearnLM en Gemini 2.5; AI Pro gratis 12 meses a universitarios en algunos países (no Perú en la lista) | Gratis | Igual: opt-in, sin señal al docente |
| **Socratic Mind** (Georgia Tech) | Examinador IA socrático por voz/texto; preprint 2025, CS1301, n=173: mejoras significativas en quizzes, sobre todo bajo rendimiento; pilotos 600–2.000 estudiantes | Académico | Preguntas de banco del curso, no de *tu* entrega; inglés. https://arxiv.org/abs/2509.16262v1 [S preprint] |
| **NYU Stern "Viva"** (Ipeirotis & Rizakos) | Examen oral por voz (ElevenLabs) personalizado al proyecto del estudiante; "consejo" de 3 LLMs califica el transcript; docente revisa y publica. 36 estudiantes F25 + 37 S26 = 73; **$15 total / $0,42 por estudiante** (≈$8 Claude, $2 Gemini, $0,30 OpenAI, ~$5 ElevenLabs) | Investigación; ElevenLabs $99/mes | El competidor más cercano. Le falta: español, mapa agregado de brechas/misconceptions por clase, sandbox de proceso, foco LatAm. arXiv 2603.18221 (CACM 2026): https://arxiv.org/abs/2603.18221 · https://the-decoder.com/nyu-professor-fights-ai-cheating-with-ai-powered-oral-exams-that-cost-42-cents-per-student/ · https://oralexam.stern.nyu.edu/ [V] |
| **Coursera AI Viva Exam** | Analiza entrega escrita → genera preguntas de seguimiento; piloto con universidad: pocos flagged, alta concordancia con equipos docentes | Piloto con clientes selectos | Texto (audio/video "a explorar"); cerrado a Coursera. https://blog.coursera.org/coursera-launches-academic-integrity-features-to-help-universities-verify-learning-in-an-age-of-ai-assisted-cheating · https://library.iated.org/view/WANG2024AIP [S] |
| **Viva (InitialView)** | Entrevista/viva por IA; usada en admisión (Caltech [S]) y piloto en Episcopal Academy | — | Orientado a admisión. https://initialview.substack.com/p/viva-viva |
| **Sherpa** (Stanford: Joseph Tey, Shaurya Sinha, 2023) | Estudiantes hablan sobre una lectura por webcam; IA pregunta estilo oral | — | **No hay vínculo con Minerva** encontrado [NV]. Críticas: follow-ups débiles, notas de chatbot al lado. https://edsurge.com/news/2023-10-05-as-ai-chatbots-rise-more-educators-look-to-oral-exams-with-high-tech-twist |
| **Integrevise** (Lindenwood) | Escrito + viva adaptativa corta; piloto F25–S26 preliminar | — | https://digitalcommons.lindenwood.edu/faculty-research-papers/814 [S] |
| **Graide** | Calificación asistida (STEM) | — | No verificado hoy [NV] |

Wharton / UCSD como pilotos de "oral exam AI": **no encontrado** [NV] (UCSD aparece solo como coautor de Socratic Mind).

**Hueco competitivo:** nadie combina (a) preguntas generadas desde *la entrega concreta*, (b) español/LatAm, (c) **mapa de brechas agregado por clase con citas de evidencia** para el docente, (d) proceso visible opcional, (e) integración Moodle. NYU Viva es la prueba de concepto de viabilidad y costo.

---

## 4. Riesgos de validez y equidad

1. **Ansiedad oral.** Real (Huxham 2012; Iceland study https://opinvisindi.is/items/85220c55-8c60-4bc2-8d44-79c87afc462e), pero Adelaide 2025 no encontró impacto en desempeño ni brechas por idioma/género. Mitigación: modo escrito equivalente, práctica sin nota, formato formativo primero, tiempo para pensar, re-intento.
2. **STT en español peruano.** No hay benchmark específico de Whisper para español peruano [V ausencia]. Whisper muestra **WER mayor en ciertos acentos** del español (Common Voice; *Applied Sciences* 2024: https://doaj.org/article/7d2ba4d5b22142b7bbe7c2e0099def63). Promedio vendor: Whisper ~5,5% WER en español (AssemblyAI, oct 2025, https://www.assemblyai.com/benchmarks — vendor, cautela). Riesgo alto con hablantes bilingües quechua/aimara-castellano, ruido, conexión móvil. Mitigación: transcript visible y editable por el estudiante, nunca calificar fluidez, piloto propio de WER con 20–30 voces peruanas, fallback a texto.
3. **Accesibilidad.** Discapacidad auditiva/del habla, neurodivergencia: modo escrito obligatorio como alternativa equivalente (UCL 2026).
4. **Fiabilidad de calificación LLM.** Concordancia LLM-humano **moderada**: QWK 0,585–0,640 en respuestas cortas (sostenibilidad, 4 LLMs, JCAL 2026) y peor en criterios de orden superior; Harvard Med GPT-4o: QWK ~0,43–0,44 (multi-grader) a kappa ~0,66–0,74 (single); un estudio de posgrado mayo 2025 halló **ninguna concordancia** (ICC 0,086; κ −0,08) — https://www.arxiv.org/pdf/2505.04645 ; ensayos QWK 0,68 (Heriot-Watt 2025). Baseline humano-humano en Kaggle ASAP-SAS ~0,89. Fuentes: https://gcris.yasar.edu.tr/entities/publication/1eeab52d-b73f-42b4-baa8-f2c94edfc8c1 · https://researchportal.hw.ac.uk/en/publications/on-automated-essay-grading-using-large-language-models/ [S abstracts]. **Diseño:** no emitir nota; emitir *evidencia + nivel sugerido* con cita textual; humano decide; consejo de varios modelos (como NYU).
5. **Sesgo.** GPT-4o infiere L1 del texto y el error de puntuación sube para no nativos cuando lo detecta (Yang et al., AIED 2025, https://arxiv.org/html/2504.21330v1); ESL alto nivel puntuado 10,3% menos que nativos de igual calidad (DeBERTa, https://arxiv.org/abs/2601.16724v1); sesgo de estilo persiste pese a instrucciones anti-sesgo (https://arxiv.org/pdf/2603.18765). Riesgo análogo para variedades del castellano andino/amazónico [inferencia]. Mitigación: rúbrica por concepto (no por forma), auditoría por subgrupo, ocultar metadatos.
6. **Privacidad (Perú).** Ley 29733 + **nuevo Reglamento DS 016-2024-JUS** (publicado 30 nov 2024, vigente ~30 mar 2025): consentimiento previo, libre, expreso e inequívoco; alcance extraterritorial (proveedores extranjeros que ofrecen servicios en Perú); Oficial de Datos Personales; nueva metodología de multas RM 476-2025-JUS (dic 2025 [S]). La **voz** puede ser dato biométrico/sensible si se usa para identificar [NV en el texto exacto]. https://cms.law/en/per/publication/nuevo-reglamento-de-proteccion-de-datos-personales · https://www.gob.pe/institucion/minjus/noticias/1067368-ejecutivo-aprueba-nuevo-reglamento-de-la-ley-de-proteccion-de-datos-personales. Diseño: no guardar audio (solo transcript), no usar voz para identificar, consentimiento granular para el log de proceso, transferencia internacional declarada (APIs EE.UU.).
7. **Ley de IA Perú.** Ley 31814 + **Reglamento DS 115-2025-PCM** (publicado ~9 sep 2025; enfoque basado en riesgo; vigencia reportada 22 ene 2026 [S]). Educación/evaluación podría caer en uso de riesgo alto — **revisar texto** (art. sobre usos de riesgo alto). https://www.gob.pe/institucion/pcm/normas-legales/7133522-115-2025-pcm · https://www.cuatrecasas.com/es/latam/tecnologia-medios-digitales/art/que-establece-el-reglamento-de-la-ley-de-inteligencia-artificial
8. **Gaming.** Estudiante con chatbot abierto en otra pestaña mientras responde (crítica a Sherpa). Mitigación: preguntas de follow-up adaptativas y de contexto personal ("¿por qué elegiste X en vez de Y?"), límite de tiempo por respuesta oral, el objetivo es formativo.

---

## 5. Adopción y negocio

- **LMS PUCP:** **PAIDEIA**, desarrollada por la DIA-PUCP sobre **Moodle** [V] (https://www.coursera.org/learn/paideia-en-pucp · https://tesis.pucp.edu.pe/repositorio/handle/20.500.12404/5752). Moodle soporta **LTI 1.3 / LTI Advantage** (deep linking + grade passback) [V conocimiento general de Moodle] → integración como External Tool sin tocar PAIDEIA. UPC, U. Lima, UPCH usan Canvas/Blackboard/Moodle [NV].
- **Costo unitario (estimado propio):** defensa de 5 min de voz.
  - STT: Deepgram Nova-3 ~$0,0043/min batch, ~$0,0077/min streaming; OpenAI gpt-4o-mini-transcribe ~$0,003/min [S agregadores — confirmar en páginas oficiales]. → 5 min ≈ **$0,02–0,04**.
  - LLM (generar 5 preguntas sobre un trabajo de ~3k palabras + evaluar respuestas, 1–3 modelos): ~$0,02–0,30 según modelo [estimación].
  - TTS opcional (voz del examinador): es lo más caro; usar texto en pantalla + respuesta por voz reduce costo.
  - Referencia real: **NYU $0,42/estudiante** todo incluido (voz bidireccional + 3 LLMs). Objetivo plausible: **<$0,25 por defensa**, ~$1–3 por estudiante/semestre con 4–8 defensas.
- **Tiempo docente:** NYU News: TA a $25/h × ~30 h para calificar la clase vs ~$0,45/estudiante con IA (https://nyunews.com/news/2026/01/28/stern-professors-ai-exams/) [S]. Un oral humano de 10 min × 40 estudiantes ≈ 7 h + logística; con Defiéndelo el docente revisa solo el mapa y los casos rojos (~30–60 min/clase) [estimación].
- **Quién paga:** (1) universidad vía licencia por estudiante activo (modelo Turnitin) — comprador: Vicerrectorado Académico / Dirección de Innovación Educativa / unidad de integridad; (2) freemium docente (como Khanmigo/GPTZero) para adopción bottom-up; (3) acreditación (SINEACE/ABET/AACSB piden evidencia de logro de competencias) como argumento de valor [inferencia].

---

## 6. Perú: contexto y políticas

- **Dato "95% de universitarios usa IA para estudiar":** **no encontré la fuente** [NV]. Lo más cercano: estudio UCSS en 9 universidades → **73,2%** usa IA para tareas académicas (82% públicas vs 67% privadas) [S]; ERESTEL 2025 (Osiptel, presentado may 2026): 16,3% de la población usa IA, 40,8% de usuarios para estudiar [S, verificar en Osiptel]. https://kom.pe/uso-ia-peru-estadisticas/ · https://larepublica.pe/tecnologia/smartphone/2024/08/24/cuales-son-las-ia-que-prefieren-los-universitarios-peruanos-investigacion-revela-insolito-resultado-1400376 . **Recomendación:** usar el 95% solo si viene del brief del hackathon y citarlo así; tener 73,2% como respaldo.
- **PUCP:** no se encontró lineamiento institucional público sobre IA generativa en evaluación [NV ausencia]; sí capacitación docente (InfoPUCP "Alquimia Digital… IA Generativa", módulo de IA para evaluación) https://infopucp.pucp.edu.pe/wp-content/uploads/2025/02/Silabos-1_compressed-2.pdf . Preguntar a jurados/organizadores; revisar sitio del Vicerrectorado Académico y DIA.
- **UPC:** *Lineamientos para el uso de herramientas de IA generativa en enseñanza-aprendizaje y assessment* (EYA-PYL-07, aprobado 5 dic 2024, v02) — https://innovacioneducativa.upc.edu.pe/wp-content/uploads/2025/02/LINEAMIENTOS_PARA_EL_USO_DE_HERRAMIENTAS_DE_INTELIGENCIA_ARTIFICIAL_GENERATIVA_EN_EL_PROCESO_DE_ENSENANZA_%E2%80%93_APRENDIZAJE_Y_ASSESSMENT.pdf [V existencia].
- **UPCH (Cayetano):** lineamientos de uso responsable/ético de IA (CU nov 2025, revisión cada 2 años) — https://educacion.cayetano.edu.pe/wp-content/uploads/sites/17/2026/01/TRANS-SEGEN-UPCH-2025-CU-1083-ANEXO-1.pdf [V existencia].
- **SUNEDU / Minedu:** no se encontró guía específica de IA para universidades [NV ausencia]. Marco general: Ley 31814 + DS 115-2025-PCM (IA), Ley 29733 + DS 016-2024-JUS (datos), Ley Universitaria 30220.

---

## 7. Implicancias para el pitch

1. Enmarcar como **pedagogía (g≈0,55) + integridad**, no detector. Citar Bastani (−17%) y Kosmyna (83% no cita su ensayo) como el problema; Sydney/TEQSA como la dirección del sector; NYU ($0,42) como prueba de viabilidad.
2. Diferenciador: **mapa de brechas por clase con citas** + español peruano + Moodle/PAIDEIA LTI.
3. Salvaguardas visibles en demo: modo texto equivalente, transcript editable, "la IA sugiere, el docente decide", sin audio almacenado, consentimiento granular.
4. Validar antes de la final: WER propio con voces peruanas; concordancia IA-docente en 20 entregas reales (meta QWK ≥0,6 y revisión humana de rojos).

## Pendientes de verificación
- Porcentajes exactos de Roediger & Karpicke 2006 y Kosmyna 2025 (leer papers).
- Fuente del "95%".
- Política IA PUCP vigente.
- Precios oficiales Deepgram / OpenAI transcribe.
- Clasificación de educación como riesgo alto en DS 115-2025-PCM; voz como dato biométrico en DS 016-2024-JUS.
- Graide, Wharton, UCSD pilots: no confirmados.
