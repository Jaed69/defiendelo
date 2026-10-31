# Deep dive G1: "Supervisa a la IA / Caja Negra del Criterio"

Fecha: 2026-10-30. Grieta 01 (escalera del primer empleo rota por IA generativa). DSC HACK 2026 PUCP.
Leyenda: [V] = verificado en fuente/abstract o resumen oficial; [S] = solo fuente secundaria; [M] = de memoria, NO verificado en esta sesión (verificar antes de citar en el pitch).

---

## 0. Problema (contexto de la grieta)

- Brynjolfsson, Chandar & Chen (2025), "Canaries in the Coal Mine?", Stanford Digital Economy Lab, datos de nómina ADP: trabajadores de 22-25 años en ocupaciones más expuestas a IA tienen **-16% de empleo relativo** (con controles de shocks de firma; la prensa reporta -13%). Los mayores de 30 en las mismas ocupaciones crecieron 6-12%. Es correlacional. [V] https://digitaleconomy.stanford.edu/publication/canaries-in-the-coal-mine/
- Lectura para el pitch: lo que se automatiza es justo la tarea junior de "producir el primer borrador". Lo que queda es **revisar, detectar y corregir**, y eso hoy no se enseña ni se certifica.

---

## 1. Ciencia del aprendizaje: ejemplos erróneos y aprender del error

| Evidencia | Hallazgo clave | Estado |
|---|---|---|
| Adams, McLaren et al. (2014), *Computers in Human Behavior* 36:401-411. 208 estudiantes de secundaria, decimales, tutor web | Sin diferencia en el post-test inmediato. En el **post-test diferido (1 semana), d = 0.62** a favor de ejemplos erróneos (identificar, explicar, corregir). Mejor metacognición, es decir, juzgar si la propia respuesta es correcta: **d = 0.49**. Satisfacción menor que en el grupo que resolvía problemas. | [V] https://www.learningscientists.org/blog/2023/7/27 ; https://dfki.de/web/forschung/projekte-publikationen/publikation/8598 |
| Tsovaltzi et al. (2011, EC-TEL), 255 estudiantes en aula | En aula **no** superó a ejemplos resueltos ni a resolución con apoyo. Los efectos son más débiles fuera del laboratorio. | [S] mismo resultado de búsqueda (DFKI) |
| Richey, McLaren et al. (2019), "More confusion and frustration, better learning" | El grupo con ejemplos erróneos tuvo más "confrustion" y aun así le fue mejor en el post-test diferido. **Lo incómodo es parte del mecanismo**: no hay que optimizar el producto para que sea "agradable". | [S] https://mail.editlib.org/p//209945 |
| **Meta-análisis Alemdag, Eichelmann & Narciss (Review of Educational Research, online nov-2025)**: 42 papers, 177 tamaños de efecto | Efecto global **significativo pero débil: g = 0.136** frente a ejemplos correctos o a resolver problemas. Moderador clave: la explicación del error (autoexplicación guiada o explicación instruccional) supera a no explicar. **Implica: el campo "justifica" del producto es el ingrediente activo, no un adorno.** | [V-abstract] https://www.leibniz-ipn.de/en/research/publications/a-framework-for-learning-from-erroneous-examples-and-meta-analysis-of-empirical-research |
| Große & Renkl (2007), *Learning and Instruction* 17(6):612-634 | Encontrar y corregir errores en ejemplos resueltos favorece la transferencia lejana **sobre todo en aprendices con alto conocimiento previo**. Para los de bajo conocimiento previo hay que **señalar el error**. Una revisión de 2025 en Educ. Psych. Review califica los resultados del campo de "inconsistentes". | Cita [V]; hallazgo [M] |
| Metcalfe (2017), "Learning from errors", *Annual Review of Psychology* 68:465-489 | Los errores seguidos de feedback correctivo mejoran el aprendizaje. **Hypercorrection**: los errores cometidos con alta confianza se corrigen mejor, y el efecto persiste una semana. | Cita [M]; hypercorrection [S] |
| Productive failure: Sinha & Kapur (2021), *Review of Educational Research*, 53 estudios y 166 comparaciones | Intentar resolver antes de la instrucción supera a "instrucción primero". Working paper: **g = 0.55-0.64** tras ajustar por sesgo de publicación. [M]: la versión publicada reporta un efecto global moderado (~0.36) que sube con alta fidelidad de implementación. | [S] https://research-collection.ethz.ch/handle/20.500.11850/572828 |
| Bastani et al. (2024/25, PNAS) "Generative AI without guardrails can harm learning", Turquía | GPT sin guardarraíles: +48% en práctica y **-17% en el examen sin IA**. GPT con guardarraíles de tutor: +127% en práctica sin daño en el examen. Apoya diseñar la IA como "colega a supervisar", no como muleta. | [M] |

**Diseño que se deduce:** (a) forzar la autoexplicación ("¿por qué está mal?"); (b) adaptar por conocimiento previo, con errores señalados para principiantes y ocultos para avanzados (fading); (c) medir en diferido, porque el beneficio aparece en la retención a 1 semana; (d) feedback correctivo inmediato después de la decisión.

---

## 2. Complacencia de automatización: la habilidad que entrena el producto

- **Dell'Acqua et al. (2023), HBS WP 24-013, "Navigating the Jagged Technological Frontier"**: 758 consultores de BCG, preregistrado. Dentro de la frontera: +12.2% de tareas, 25.1% más rápido y >40% más calidad [M para estas 3 cifras]. **Fuera de la frontera**: correcto 84.4% sin IA vs **~70% con GPT-4 y ~60% con GPT-4 más entrenamiento en prompts**, es decir, ~19 pp menos. Las respuestas erróneas eran "pulidas y plausibles". [S] Paper: https://www.hbs.edu/faculty/Pages/item.aspx?num=64700 [URL M]
  - Dato clave para el pitch: **el entrenamiento en prompts empeoró el resultado fuera de la frontera**. Enseñar a "usar IA" no es enseñar a "supervisar IA".
- **Dell'Acqua (2022), "Falling Asleep at the Wheel"**: 181 reclutadores, ~8,000 CVs, calidad de la IA aleatorizada. **Con una IA de mayor calidad fueron menos precisos** que con una IA peor: menos esfuerzo y confianza ciega. Con la IA de baja calidad aprendieron a interactuar mejor. Baseline sin IA: ~72.3%; "IA buena": 85% [S, blog]. [S] https://innovationgrowthlab.org/node/1447 ; https://blog.jcx.au/posts/human-ai-collaboration-is-it-better-when-the-human-is-asleep-at-the-wheel
  - Implicación directa: **inyectar errores deliberados mantiene al humano despierto**. Es el mecanismo del producto.
- **Radiología, Dratsch et al. (2023), *Radiology***: 27 radiólogos, 50 mamografías con sugerencias BI-RADS de IA. Inexpertos: **79.7% de acierto si la IA acertaba vs 19.8% si la IA erraba**. Muy expertos: ~82% → 45.5%. "Todos los radiólogos son susceptibles a sesgo de automatización." IA simulada, muestra pequeña. [V-prensa] https://www.auntminnie.com/clinical-news/article/15633344/breast-radiologists-impacted-by-automation-bias-when-using-ai ; https://oecd.ai/en/incidents/2023-05-02-9b21
  - Estudio piloto (2026?): con falsos negativos de la IA, la sensibilidad mediana cae de **71% a 39%** (10 lectores). [S, fecha no verificada] https://www.diagnosticimaging.com/view/mammogram-interpretation-ai-automation-bias-new-research-
  - **Los juniors son los más vulnerables.** Es el público objetivo.
- **Lee et al. (CHI 2025, Microsoft Research + CMU)**: 319 knowledge workers, 936 tareas. La confianza en la IA se asocia a **menos** pensamiento crítico y la autoconfianza a **más**. Describen el desplazamiento del trabajo "de ejecutar a supervisar". El "62% piensa menos críticamente" no está verificado. [V-prensa] https://www.theregister.com/2025/02/11/microsoft_study_ai_critical_thinking/
- **Las intervenciones funcionan parcialmente**: Buçinca, Malaya & Gajos (2021, CSCW), 199 participantes. Las *cognitive forcing functions* reducen la sobreconfianza frente a XAI simple, **pero no la eliminan**. Los participantes calificaron peor justamente los diseños más eficaces. El beneficio fue mayor en personas con alta "need for cognition". [V] https://arxiv.org/abs/2102.09692
  - Riesgo: una buena pedagogía genera UX "molesta". Hace falta gamificación o un incentivo de señal laboral para sostener la motivación.
- BCG brief "When a Human in the Loop Is Not Enough": pedir supervisión humana sin más falla cuando la IA parece muy confiable. [S] https://media-publications.bcg.com/229-Weekly-Brief-When-a-Human-in-the-Loop-Is-Not-Enough.pdf

---

## 3. Evidencia de señal de contratación

| Estudio | Intervención | Efecto | Estado |
|---|---|---|---|
| **Pallais (2014), AER 104(11):3565-99**, oDesk, 952 trabajadores contratados al azar | Dar un primer empleo más una evaluación pública (detallada vs gruesa) | Los ingresos de los inexpertos **~se triplicaron** en los 2 meses siguientes. La evaluación detallada sube ingresos y salario pedido, y el efecto crece con el tiempo. **Ayuda a quien rinde bien y perjudica a quien rinde mal.** El beneficio de mercado superó el costo, así que había desempleo ineficiente. | [V] https://www.nber.org/papers/w18917 |
| **Carranza, Garlick, Orkin & Rankin (2022), AER**, "Job Search and Hiring with Limited Information about Workseekers' Skills". Johannesburgo, 6,891 buscadores (Harambee) | Evaluación de habilidades más certificado compartible con empleadores | Empleo **+5.2 pp (+17.3%)** a 3-4 meses; **ingresos +34%**. El certificado "privado", no compartible, tiene efecto menor en ingresos. Postulaciones con certificado: **+11% de invitaciones a entrevista**. Beneficio en ingresos = **2.3x el costo variable**. | [V] https://www.aeaweb.org/articles?id=10.1257/aer.20200961 ; https://www.povertyactionlab.org/node/3196342 ; https://voxdev.org/node/66334 |
| **Abebe, Caria, Fafchamps, Falco, Franklin & Quinn** (REStud 2021; NBER w22409), Addis Abeba | Taller de postulación con **certificación de habilidades** vs subsidio de transporte | A 8 meses no hay efecto. **Largo plazo: empleo formal +5 pp (+30%, base 17%).** El mecanismo es una señal que reduce la asimetría de información. | [V-JPAL] https://www.povertyactionlab.org/evaluation/anonymity-or-distance-removing-obstacles-youth-employment-urban-ethiopia |
| **Bassi & Nansamba (2022), Economic Journal 132(642):471-511**, Uganda, 787 jóvenes y 422 PYMEs | Certificado de **habilidades blandas** mostrado a ambas partes (el control recibe un placebo) | **No aumenta la probabilidad de empleo**, pero mejora el matching asortativo: **~+11% de salario** condicional en empleo. | [V] https://doi.org/10.1093/ej/ueab071 |

**Lección de diseño:** la señal funciona si es (1) **creíble y de tercero**, (2) **compartible** (Carranza: el certificado privado rinde menos), y (3) **detallada** (Pallais). El QR verificable responde a (2). La credibilidad del emisor (3) es el cuello de botella: la universidad co-firma.

**Skills-based hiring, la realidad:**
- Harvard Business School + Burning Glass Institute, "Skills-Based Hiring: The Long Road from Pronouncements to Practice" (feb-2024), 11,300 firmas grandes 2014-2023. Quitar el requisito de título se tradujo en **~97,000 contrataciones de 77 millones al año, menos de 1 de cada 700** en 2023. El 37% de las firmas ("SBH Leaders") hace casi todo el cambio, y en ellas **los no titulados retienen 10 pp más**. [V] https://pw.hks.harvard.edu/post/skills-based-hiring-the-long-road-from-pronouncements-to-practice
  - Para el pitch es un argumento a favor y en contra: los empleadores **dicen** querer habilidades pero no cambian su práctica porque **les falta evidencia confiable de habilidad**. El portafolio de juicio apunta a ese vacío.
- **WEF Future of Jobs 2025**: el pensamiento analítico es la habilidad central nº1 (**~69-70%** de los empleadores la considera esencial). Le siguen resiliencia/flexibilidad (67%), liderazgo (61%) y pensamiento creativo (57%). **"AI & big data" encabeza la lista de habilidades de más rápido crecimiento a 2030** [M; el resultado de búsqueda no lo confirmó textualmente]. Se espera que cambie ~39% de las habilidades centrales al 2030 [M]. [V] https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/3-skills-outlook/
- Validez predictiva (Sackett, Zhang, Berry & Lievens 2022, J. Appl. Psych.): **work samples ~0.33** (antes 0.54 en Schmidt-Hunter) y **entrevista estructurada ~0.42**, la nº1. [S, cifras de blogs que citan la Tabla 3] https://www.siop.org/tip-article/is-cognitive-ability-the-best-predictor-of-job-performance
  - La simulación es una *work sample*: tiene validez moderada y real, pero no es una bala de plata. Combinarla con una entrevista estructurada sobre el portafolio ("defiende tu decisión 7") aprovecha ambas.

---

## 4. Competidores

| Actor | Qué hace | Datos | Qué le falta frente a la propuesta |
|---|---|---|---|
| **Forage** (adquirida por EAB en abr-2024) | Simulaciones de trabajo gratuitas diseñadas con empleadores | >10M engagements (2025). Datos propios: **2x entrevista y 3x oferta**. Un banco Fortune 500: los Foragers eran el 9% de los postulantes y recibieron el 70% de las ofertas. ~20% de las contrataciones junior de empleadores participantes usaron Forage. **Sin estudio independiente: sesgo de selección** (los motivados completan). | Las tareas son "haz el entregable", no "audita a la IA". La evidencia es de completitud, no de juicio granular. Poca presencia en Perú y en español. [S] https://eab.com/about/newsroom/press/forage-job-simulations-surpass-10-million-student-engagements/ ; https://campustechnology.com/articles/2024/04/23/eab-to-acquire-job-simulation-company-forage.aspx |
| **Parker Dewey / Riipen** | Micro-internships pagadas y proyectos reales en aula (EE. UU./Canadá) | [M] Riipen en universidades canadienses; Parker Dewey usa proyectos de 5-40 h | Dependen de la oferta de proyectos de empresas, no escalan en LatAm y no entrenan supervisión de IA. |
| **HackerRank / Codility** | Evaluación técnica de código | [M] Incorporaron tareas "AI-assisted" y code review en 2024-25 [no verificado] | Solo código y solo evaluación (no forman). Contabilidad/derecho/administración no están cubiertos. |
| **Pymetrics (Harver)** | Juegos neurocientíficos de rasgos | [M] Críticas por validez y opacidad | Mide rasgos, no juicio de dominio. Es caja negra, lo opuesto al portafolio auditable. |
| **Anthropos** | 100+ simulaciones (ventas, marketing, soft skills) para verificar habilidades | [S] https://ca.trustpilot.com/review/anthropos.work | No se encontraron simulaciones de revisión de outputs de IA. |
| **Laboratoria (Perú)** | Bootcamp tech para mujeres con colocación | Empleabilidad **~75%** (2026, antes >80%). >1,100 empresas contratantes y >4,000 egresadas [S] https://proactivo.com.pe/?p=67218 | Es un bootcamp largo de un solo dominio (tech). Es un posible **aliado** (módulo de QA de código generado por IA), no un rival. |
| **Crehana (Perú)** | Upskilling B2B y HR-tech | ~1,000 clientes corporativos (2022), 85% de los ingresos B2B (2023), 7 soluciones de IA en 2025 [S] https://forbes.pe/negocios/2025-03-03/crehana-lanzara-siete-soluciones-basadas-en-ia-y-se-enfocara-en-crecer-en-latinoamerica-durante-2025/ | Cursos y videos, no simulación con errores sembrados ni evidencia verificable de juicio. Posible canal de distribución. |
| Cursos genéricos "verifica la IA" (AhaSlides, EdgePoint Learning) | Microcursos sobre detectar alucinaciones | [S] https://www.edgepointlearning.com/ai-critical-evaluation-training-employees-verify-ai-outputs/ | Genéricos, sin dominio profesional y sin señal de contratación. |

**Hallazgo:** no se encontró ningún actor que combine (a) errores sembrados de dominio profesional (contable/legal/administrativo), (b) justificación registrada y (c) credencial verificable dirigida a empleadores. **No es prueba de inexistencia**: la búsqueda fue limitada y conviene revisar Product Hunt/YC 2025-26 ("AI QA training", "human-in-the-loop certification").

---

## 5. Perú

- **INEI, "Doble desafío tecnológico"** (Omar Manky Bonilla, Centro de Investigación INEI, ENAHO 2024, presentado a fines de 2025): **24.1% de la fuerza laboral tiene alta exposición a IA generativa**, sobre todo trabajadores técnico-administrativos formales. En esas ocupaciones **<17% de las tareas** se afectaría en promedio, lo que apunta a aumento más que a reemplazo total. Ocupaciones altamente expuestas: **técnicos en contabilidad, técnicos en administración, técnicos del derecho** (y contadores, según otra nota). 20% expuesto a automatización tradicional. [V-prensa] https://andina.pe/agencia/noticia-inei-trabajos-estan-riesgo-desaparecer-por-automatizacion-y-ia-1054165.aspx ; https://elperuano.pe/noticia/284173-inei-que-trabajos-podrian-ser-reemplazados-por-la-automatizacion-y-la-ia-generativa-en-el-peru
  - Encaja directo con los 3 dominios piloto de la propuesta.
- **Volumen de egresados:** no se obtuvo una cifra nacional por carrera (SUNEDU/Ponte en Carrera no aparecieron en la búsqueda). El MTPE dice que Administración, Contabilidad/Finanzas y Derecho son las profesiones con **mayor presencia en el mercado laboral** [S] https://andina.pe/ingles/noticia-ponte-carrera-se-renueva-estudiar-cual-es-demanda-laboral-y-cuanto-pagan-687992.aspx
  - **PENDIENTE:** descargar los datos abiertos de SUNEDU (Registro Nacional de Grados y Títulos) y filtrar bachilleres por programa. Ordenes de magnitud [M, no verificado]: decenas de miles de bachilleres por año sumando las tres carreras. **No citar un número hasta verificarlo.**
- **Mercado juvenil:** desempleo de menores de 25 años **16.5%** (jul-2024 a jun-2025, ~2x el promedio, CIES) [S] https://cies.org.pe/wp-content/uploads/2026/04/Empleo-y-formalizacion_PPT.pdf. Empleo juvenil en Lima **-9.5% en 2025** [S] https://infomercado.pe/inei-reporta-que-el-empleo-juvenil-en-lima-cayo-9-5-durante-el-2025/. Informalidad juvenil ~75-85% según la fuente [S]. El desempleo nacional cerró 2025 en 4.9%. Gestión (ago-2026, OIT): el desempleo juvenil está en su **máximo de casi una década** [S].
- **Oficinas de carrera:** no hay datos de adopción. Hipótesis: la acreditación SINEACE/SUNEDU exige seguimiento de egresados y empleabilidad, lo que es un incentivo institucional [M, verificar el estándar]. La PUCP puede ser el piloto.
- **Dolor del empleador (time-to-productivity de juniors):** no se encontró un dato peruano. **PENDIENTE:** encuesta a 5-10 estudios contables/legales en la validación de la hackathon.

---

## 6. Contra-evidencia y riesgos

1. **Transferencia simulación → trabajo real:** el meta-análisis de ejemplos erróneos da un efecto global débil (g = 0.136) y la réplica en aula (Tsovaltzi 2011) falló. Las work samples tienen validez de ~0.33, real pero moderada. *Mitigación:* errores de casos reales anonimizados, medición diferida, y validar con supervisores que el puntaje predice el desempeño en los primeros 3 meses (piloto con 1-2 empleadores).
2. **Gaming del portafolio:** el estudiante puede usar otra IA para detectar los errores sembrados (ironía: eso también es supervisión). *Mitigación:* (a) justificación oral o por escrito cronometrada, con entrevista estructurada sobre el portafolio; (b) banco de errores rotativo y paramétrico; (c) **registrar el proceso** (tiempo, orden, falsos positivos) y no solo los aciertos; (d) incluir "trampas": tareas **sin** errores para medir falsos positivos y sobre-sospecha.
3. **Confianza del empleador en una credencial nueva:** HBS/BGI muestra que el discurso de skills-based hiring no se traduce en práctica (<1/700). Carranza muestra que solo funciona la señal creíble y compartible. *Mitigación:* co-emisión universidad + gremio (p. ej., Colegio de Contadores), rúbricas co-diseñadas con empleadores ancla, y mostrar evidencia granular (decisiones concretas), no un puntaje opaco.
4. **Pallais: la señal detallada perjudica a los de bajo rendimiento.** Hay un riesgo de equidad. *Mitigación:* el estudiante controla qué comparte y hay un modo práctica privado (aunque Carranza muestra que el certificado privado rinde menos: hay tensión de diseño).
5. **El LLM puede no generar errores realistas.** En distractores matemáticos, los LLM producen errores válidos pero **anticipan peor los errores reales de estudiantes** (Feng et al., NAACL 2024 Findings). En código, GPT-4o coincide con ~50% de los distractores humanos. Además, el LLM puede introducir **errores no planificados** que invalidan la clave de respuesta. [V] https://par.nsf.gov/biblio/10613695-generating-effective-distractors-introductory-programming-challenges-llms-vs-humans ; búsqueda ACL Feng et al. *Mitigación:* **errores sembrados de forma determinista** (plantilla más mutación programática: cambiar un monto, invertir un signo, borrar una cláusula o un vencimiento) y que el LLM solo genere la prosa. Clave de respuesta verificada por un experto y validación automática (p. ej., cuadre contable recalculado por código).
6. **Frustración/UX:** los diseños que más reducen la sobreconfianza son los peor valorados (Buçinca 2021), y los erróneos generan más "confrustion". El enganche debe venir del incentivo laboral, no del disfrute.
7. **Desfase de dominio:** los errores de la IA cambian con cada modelo (la "frontera dentada" se mueve). El banco de errores necesita actualizarse y es un costo operativo continuo.
8. **Evidencia de Forage = marketing:** no usar sus cifras como prueba de impacto en el pitch sin aclarar que son de la propia empresa y sin control de selección.

---

## 7. Frase-ancla para el pitch (con su respaldo)

"La IA ya hace el primer borrador del junior. Lo que el mercado necesita, y nadie certifica, es quien detecta cuándo la IA se equivoca. Con IA errónea los consultores de BCG fallaron ~19 pp más, y los radiólogos novatos bajaron de 80% a 20% de acierto. Entrenar con errores sembrados mejora la retención diferida (d = 0.62 en Adams et al.), y una señal de habilidad creíble y compartible subió el empleo juvenil 17% y los ingresos 34% (Carranza et al., AER 2022)."

## Pendientes de verificación (prioridad)
1. Cifras de egresados por carrera (SUNEDU datos abiertos).
2. WEF 2025 "AI & big data = habilidad de más rápido crecimiento" (texto exacto).
3. Cifras dentro de la frontera de Dell'Acqua 2023 (12.2% / 25.1% / 40%) y la URL HBS.
4. Hallazgo exacto de Große & Renkl 2007 y Metcalfe 2017 (paper completo).
5. Búsqueda de competidores YC/Product Hunt 2025-26 "AI output review".
