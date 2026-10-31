# Reconstruir con IA la experiencia que la IA borra

Las cuatro grietas del DSC HACK 2026 tienen evidencia peruana citable y una tendencia creíble hacia 2036. Las soluciones con mejor respaldo se parecen entre sí: vuelven a crear el canal "esfuerzo propio, retroalimentación de un experto y una señal verificable" que la IA generativa está erosionando. En el primer empleo, las firmas dejaron de contratar en la base. En el aula, la IA mejora la tarea y empeora el aprendizaje medido sin IA (−17% en el experimento de Bastani). En la docencia, el 22% de los profesores de secundaria tiene 55 años o más y el cese es a los 65. Fuera del sistema hay más de 1,3 millones de ninis, y el 44% sigue en esa condición al año siguiente. Este informe corrige varias cifras del reto que solo se sostienen en parte: los "87 mil docentes formados en IA" son inscritos (el propio Minedu reporta después 65 mil formados), el meta-análisis de tutoría de Kraft es un working paper de 2024 y el 24,1% de exposición a IA del INEI se publicó en diciembre de 2025, no en septiembre de 2026. Después propone 16 soluciones de software desplegables en un día, cada una con su evidencia, usuario de validación, métrica y modelo de negocio, y las puntúa contra la rúbrica. Las tres recomendadas son **"Tutores del Relevo"** (cruza las grietas 01, 02 y 03), **"Defiéndelo"** (grieta 02) y **"Supervisa a la IA"** (grieta 01). Las tres pueden probarse con usuarios reales durante el propio hackathon y ninguna cae en las categorías que los organizadores descartan.

## Las cifras del reto se sostienen, pero varias necesitan otra redacción

Antes de construir el pitch conviene usar la versión verificada de cada dato. El jurado pondera el problema y la evidencia con un 30%, y un número mal atribuido resta credibilidad a todo lo demás. La tabla resume las correcciones que surgieron de contrastar las fuentes.

| Cifra tal como suele circular | Qué dicen las fuentes | Cómo citarla |
|---|---|---|
| "87 mil docentes formados en IA" | El Minedu habla de "más de 87 000 docentes" **inscritos** en el curso virtual "IA en la práctica docente" ([Minedu](https://www.gob.pe/institucion/minedu/noticias/1164507-minedu-capacita-a-mas-de-87-000-docentes-en-inteligencia-artificial-en-el-ambito-nacional); [La República, 13/05/2025](https://larepublica.pe/educacion/2025/05/13/capacitacion-en-inteligencia-artificial-para-87000-docentes-en-peru-en-que-consiste-y-como-impactara-la-educacion-atmpa-706394)). Una nota posterior reporta **65 000 formados en IA** ([Minedu](https://www.gob.pe/institucion/minedu/noticias/1226128-gobierno-impulsa-transformacion-digital-que)). No se ubicó la nota de La República del 05/07/2026 | "87 mil inscritos y 65 mil formados, de 430 mil docentes públicos": entre 15% y 20% de cobertura, sin datos sobre uso en aula |
| Meta-análisis de tutoría de Kraft | Kraft, Schueler y Falken, EdWorkingPaper 24-1031: **working paper de 2024**. No se confirmó su publicación en revista ([EdWorkingPapers](https://edworkingpapers.com/ai24-1031)) | "Working paper (2024) con 265 RCT". Efecto de ~0,42 DE que cae a entre un tercio y la mitad en programas grandes |
| "24,1% de trabajadores expuestos a IA (Infobae, 26/09/2026)" | El estudio del INEI "Doble desafío tecnológico" (ENAHO 2024) se difundió hacia el **2 de diciembre de 2025**. El 24,1% mide **alta exposición**, no reemplazo ([El Peruano](https://elperuano.pe/noticia/284173-inei-que-trabajos-podrian-ser-reemplazados-por-la-automatizacion-y-la-ia-generativa-en-el-peru); [La República](https://larepublica.pe/economia/2025/12/02/contabilidad-administracion-programacion-y-otras-carreras-en-que-la-ia-generativa-pondria-en-riesgo-segun-el-inei-evat-22490)) | Distinguir tres cifras: 24,1% de alta exposición (INEI), 31% de exposición total (Banco Mundial) y 2% a 5% de riesgo de automatización completa (OIT y Banco Mundial para LatAm) |
| "Caída de 13% del empleo juvenil por IA" | Brynjolfsson, Chandar y Chen: −13% **relativo** en trabajadores de 22 a 25 años en las ocupaciones más expuestas de EE. UU. (datos hasta julio de 2025). Con datos hasta octubre de 2025 la caída llega a **~16%**. Los autores no la presentan como prueba causal ([Stanford DEL](https://digitaleconomy.stanford.edu/publications/canaries-in-the-coal-mine); [actualización feb. 2026](https://digitaleconomy.stanford.edu/news/canaries-interest-rates-and-timinga-more-on-recent-drivers-of-employment-changes-for-young-workers)) | "13% a 16% en EE. UU., concentrado donde la IA automatiza y no donde aumenta". No existe una réplica peruana |
| "1 de cada 5 profesores tiene 55+" | OCDE, *Education at a Glance 2026* vía Gestión: **22% de los docentes de secundaria**, no del total ([Gestión](https://gestion.pe/economia/peru-1-de-cada-5-profesores-de-secundaria-tiene-55-anos-hay-personal-listo-para-el-relevo-noticia/)) | Aplicarlo a todo el magisterio (unos 95 mil docentes a reemplazar) es un supuesto propio y hay que presentarlo como tal |
| "95% de universitarios usa IA" | Reporte de uDocz (edtech con interés comercial) sin muestra ni metodología públicas. Cobertura de El Peruano del 25/08/2025 ([El Peruano](https://elperuano.pe/noticia/277486-como-se-usa-inteligencia-artificial-en-la-educacion-superior)) | Citarlo con la advertencia y combinarlo con el dato de que solo el 41% la usa "de forma efectiva" |
| Ninis | IEDEP-CCL con ENAHO 2025: más de 1,3 millones (15%) ([La Cámara](https://lacamara.pe/poblacion-nini-2025-no-baja-de-los-1-3-millones/)). Desde 2024 hay un quiebre metodológico: ya no se cuenta a quienes buscan trabajo ([La República](https://larepublica.pe/economia/2025/07/05/el-pais-de-los-ninis-mas-de-15-millones-de-jovenes-fuera-del-estudio-y-del-trabajo-hnews-473445)) | Usar una sola serie y explicar el método. La cifra viene de prensa de la CCL, no del informe original |
| PISA 2025 Perú | Matemática 382 frente a 391 en 2022 (−9). Algunas notas usan 408 como base y calculan −26 ([Caretas](https://caretas.pe/?p=832776)) | "−9 puntos. Alrededor del 70% está bajo el nivel 2 en matemática" |

La lección común es que la mayoría de las cifras virales miden **exposición**, **inscripción** o **asociación**, y el pitch las presenta como **impacto**, **formación** o **causalidad**. Un equipo que corrige esto delante del jurado gana puntos en el criterio de evidencia.

## Grieta 01: las firmas dejaron de contratar en la base

### El mecanismo es un congelamiento de entrada, no despidos

La evidencia más sólida viene de EE. UU. y apunta a un mismo mecanismo. Con datos de nómina de ADP, los trabajadores de 22 a 25 años en las ocupaciones más expuestas a la IA sufrieron una caída relativa del empleo de **13%**, controlando por shocks a nivel de firma. Los trabajadores mayores de esas mismas ocupaciones no cayeron. La caída se concentra donde la IA **automatiza** y no aparece donde **aumenta** el trabajo humano ([Stanford DEL](https://digitaleconomy.stanford.edu/publications/canaries-in-the-coal-mine)). Con datos a octubre de 2025, la caída se amplió a **~16%** ([Stanford DEL, feb. 2026](https://digitaleconomy.stanford.edu/news/canaries-interest-rates-and-timinga-more-on-recent-drivers-of-employment-changes-for-young-workers)). Lichtinger y Hosseini analizaron ~62 millones de currículos y 285 mil firmas, y llegan a lo mismo por otra vía: desde el primer trimestre de 2023, el empleo junior en las firmas que adoptan IA cae ~9-10% relativo tras seis trimestres. La caída ocurre **por menos contrataciones**, no por más despidos ([SSRN 5425555](https://www.alejandrobarros.com/wp-content/uploads/2025/11/ssrn-5425555.pdf)). Lo resume una frase citada en Gestión: "no hubo despidos masivos: las empresas dejaron de contratar en la base" ([Gestión, 20/10/2026](https://gestion.pe/opinion/sin-escalera-de-aprendizaje-el-impacto-de-la-ia-en-los-jovenes-noticia/)).

### En Perú la exposición cae sobre el primer empleo "bueno"

En Perú, el **24,1%** de la fuerza laboral tiene alta exposición a la IA generativa, sobre todo técnicos en administración, contabilidad y derecho, además de programadores ([El Peruano](https://elperuano.pe/noticia/284173-inei-que-trabajos-podrian-ser-reemplazados-por-la-automatizacion-y-la-ia-generativa-en-el-peru)). El Banco Mundial eleva la exposición al 31% y la concentra en el empleo formal, urbano y universitario, con los **recién egresados** entre los perfiles más expuestos ([Gestión](https://gestion.pe/opinion/sin-escalera-de-aprendizaje-el-impacto-de-la-ia-en-los-jovenes-noticia/)). Esas ocupaciones son el primer peldaño natural de un egresado.

La señal local más fuerte es de 2025: en Lima Metropolitana, el empleo de 14 a 24 años **cayó 9,5%**, mientras el empleo formal total subió 11,9% y el de los mayores de 45 años subió 8% ([Infomercado/INEI](https://infomercado.pe/inei-reporta-que-el-empleo-juvenil-en-lima-cayo-9-5-durante-el-2025/)). El patrón es consistente con una "escalera rota", aunque no prueba que la causa sea la IA. Quien no entra a la escalera se desvía hacia abajo: la informalidad juvenil (14-24 años) es **85,3%** ([Gestión](https://gestion.pe/economia/en-menores-de-25-anos-la-informalidad-es-de-85-este-seria-el-panorama-hacia-el-2030-precariedad-laboral-desempleo-juvenil-mercado-laboral-noticia/)), el desempleo de los menores de 25 años es 10,7%, el doble del promedio, y no existe seguro de desempleo ([Gestión](https://gestion.pe/opinion/sin-escalera-de-aprendizaje-el-impacto-de-la-ia-en-los-jovenes-noticia/)). Además, el desajuste ocupacional ya afecta al **60,7%** de los recién egresados universitarios ([Repositorio PUCP](https://repositorio.pucp.edu.pe/index/handle/123456789/167991)).

### Qué funciona, según los ensayos aleatorizados

Lo que funciona tiene dos componentes, y una bolsa de empleo no aporta ninguno. El primero es **experiencia real con evaluación detallada**. En el experimento de Pallais en oDesk, tanto ser contratado como recibir una evaluación detallada mejoraron sustancialmente el empleo posterior de trabajadores inexpertos. Las firmas contratan demasiado pocos novatos porque no capturan el valor de la información que generan sobre ellos ([Pallais 2014, AER](https://pallais.scholars.harvard.edu/publications/inefficient-hiring-entry-level-labor-markets)). El segundo es **una señal de habilidad estandarizada**. Los certificados de habilidades de Carranza y coautores en Sudáfrica subieron el empleo en 5 pp y los ingresos en 34%, con 11% más invitaciones a entrevista ([VoxDev](https://www.voxdev.org/topic/labour-markets/reducing-labour-market-information-frictions-skill-certificates-evidence-south)).

Los programas que combinan formación con práctica en empresa también tienen resultados grandes y duraderos. Jóvenes en Acción en Colombia logró +12,2% de ingresos formales a 8 años ([Attanasio et al. 2017](https://discovery-pp.ucl.ac.uk/1563836/1/app.20150554.pdf)). Year Up en EE. UU. logró +38% de ingresos y US$1,66 de beneficio por cada dólar invertido ([OPRE/ACF](https://acf.gov/opre/report/still-bridging-opportunity-divide-low-income-youth-year-ups-longer-term-impacts)). En Perú, ProJoven mostró impactos de largo plazo sobre la formalidad ([Andina/CAF](https://andina.pe/ingles/noticia-caf-programas-laborales-aumentan-oportunidades-empleo-formal-peru-669627.aspx)).

### Hacia 2036: la "deuda de experiencia"

El argumento de crecimiento se puede llamar **deuda de experiencia**. La cohorte que egrese entre 2030 y 2036 no habrá tenido las tareas de aprendizaje que la IA absorbió, y eso anticipa una escasez de semi-seniors. Es una inferencia propia, no un pronóstico citado. La sostienen tres datos: el efecto creció de 13% a 16% en un año, el índice de la OIT es una foto de 2025 que no incorpora capacidades futuras ([OIT WP140](https://www.developmentaid.org/api/frontend/cms/file/2025/05/WP140_web.pdf)) y la brecha en las firmas adoptantes se amplía trimestre a trimestre.

| Paper o fuente clave | Hallazgo | Enlace |
|---|---|---|
| Brynjolfsson, Chandar y Chen (2025), "Canaries in the Coal Mine?" | −13% (luego ~16%) en jóvenes de 22-25 años de ocupaciones expuestas; solo donde la IA automatiza | [Stanford DEL](https://digitaleconomy.stanford.edu/publications/canaries-in-the-coal-mine) |
| Lichtinger y Hosseini, "GenAI as Seniority-Biased Technological Change" | −9-10% de empleo junior en firmas adoptantes, por menos contrataciones | [SSRN 5425555](https://www.alejandrobarros.com/wp-content/uploads/2025/11/ssrn-5425555.pdf) |
| OIT, Gmyrek et al. (2025), WP140 | ~25% del empleo mundial expuesto; índice ISCO-08 a 4 dígitos; exposición no equivale a pérdida | [PDF](https://www.developmentaid.org/api/frontend/cms/file/2025/05/WP140_web.pdf) |
| OIT-Banco Mundial (2024), LatAm | 26-38% expuesto, 2-5% automatizable; más riesgo para jóvenes formales | [Forbes Perú](https://forbes.pe/capital-humano/2024-08-01/la-ia-podria-afectar-hasta-un-38-de-empleos-de-america-latina-y-automatizar-totalmente-un-5/) |
| Pallais (2014), AER | Contratación y evaluación detallada mejoran el empleo posterior | [Harvard](https://pallais.scholars.harvard.edu/publications/inefficient-hiring-entry-level-labor-markets) |
| Carranza, Garlick, Orkin y Rankin | Certificados: +5 pp de empleo, +34% de ingresos | [J-PAL](https://www.povertyactionlab.org/blog/11-4-20/reducing-labour-market-information-frictions-skill-certificates-evidence-south-africa) |
| Attanasio et al. (2017), Jóvenes en Acción | +12,2% de ingresos formales a 8 años | [UCL](https://discovery-pp.ucl.ac.uk/1563836/1/app.20150554.pdf) |
| Year Up, RCT nacional | +38% de ingresos; US$1,66 por US$1 | [OPRE](https://acf.gov/opre/report/still-bridging-opportunity-divide-low-income-youth-year-ups-longer-term-impacts) |

## Grieta 02: la IA mejora la tarea y empeora el aprendizaje

### El problema es de uso, no de acceso

En Perú la brecha no está en el acceso. Según uDocz, el 95% de los universitarios usa IA, solo el 41% la usa "de forma efectiva", el 80% teme ser acusado de plagio y solo el 21% de los docentes se siente preparado ([El Peruano](https://elperuano.pe/noticia/277486-como-se-usa-inteligencia-artificial-en-la-educacion-superior)). A escala global, Anthropic analizó 574.740 conversaciones de cuentas universitarias y encontró que ~47% eran "directas": pedir la respuesta con un mínimo de involucramiento. La IA ejecutaba sobre todo tareas de alto orden de Bloom (Crear 39,8%, Analizar 30,2%), es decir, el estudiante delega justo el pensamiento de nivel superior ([Anthropic](https://www.anthropic.com/research/anthropic-education-report-how-university-students-use-claude)).

### La evidencia causal más dura

El estudio de Bastani y coautores en PNAS, con casi 1.000 estudiantes de secundaria en Turquía, es la evidencia causal más fuerte. Con una interfaz tipo ChatGPT, el rendimiento en la práctica subió 48%. Al retirar la IA, ese grupo rindió **17% menos** que quienes nunca la tuvieron. Una versión con salvaguardas, que da pistas y no respuestas, mitigó en gran medida el daño ([Wharton](https://knowledge.wharton.upenn.edu/article/without-guardrails-generative-ai-can-harm-education/); [PNAS vía RePEc](https://ideas.repec.org/a/nas/journl/v122y2025pe2422633122.html)). La OCDE lo resume en su *Digital Education Outlook 2026*: las herramientas generales "can enhance students' performance on tasks, [but] do not necessarily lead to learning gains" ([OCDE](https://www.oecd.org/en/publications/oecd-digital-education-outlook-2026_062a7394-en.html)).

Hay otras señales que apuntan en la misma dirección, aunque son más débiles. En el estudio con EEG del MIT, el grupo que usó LLM mostró la conectividad neural más débil y le costaba citar su propio ensayo. Quienes pensaron primero sin IA y la usaron después rindieron mejor que quienes siguieron el orden inverso. Es un preprint con 54 participantes ([MIT Media Lab](https://www.media.mit.edu/publications/your-brain-on-chatgpt/)). En una encuesta de Microsoft Research a 319 trabajadores del conocimiento, más confianza en la IA se asoció a menos pensamiento crítico, y el pensamiento crítico se desplaza hacia **verificar y supervisar** ([Microsoft Research](https://www.microsoft.com/en-us/research/?p=1135061)).

### Cuando el diseño es pedagógico, la IA sí ayuda

El contrapunto es igual de fuerte. Un tutor de IA con principios pedagógicos (paso a paso, sin revelar la solución, contenido curado por el docente) produjo en Harvard ganancias más del doble que una clase de aprendizaje activo, en menos tiempo ([ETC Journal sobre Kestin et al.](https://etcjournal.com/2025/11/10/review-of-kestin-et-al-s-june-2025-harvard-study-on-ai-tutoring/)). En Nigeria, Copilot **guiado por docentes** produjo 0,31 DE en 6 semanas ([Banco Mundial](https://blogs.worldbank.org/en/education/From-chalkboards-to-chatbots-Transforming-learning-in-Nigeria)). La variable decisiva es el diseño. Brookings lo resume en su recomendación 3: "Use AI tools that teach, not tell" ([Brookings](https://webdocs.gmu.edu/wp-content/uploads/A-New-Direction-for-Students-in-an-AI-World.pdf)).

La ciencia del aprendizaje explica el porqué con décadas de evidencia. La práctica de recuperación ([Roediger y Karpicke 2006](https://doi.org/10.1111/j.1467-9280.2006.01693.x)), las dificultades deseables ([Bjork y Bjork 2011](https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/04/EBjork_RBjork_2011.pdf)), el marco ICAP ([Chi y Wylie 2014](https://doi.org/10.1080/00461520.2014.965823)) y la falla productiva (~0,36 DE; [Sinha y Kapur 2021](https://doi.org/10.3102/00346543211019105)) muestran que aprender exige el esfuerzo que la IA por defecto elimina.

### Por qué no basta con los modos de estudio

Hay un hueco estratégico. OpenAI y Anthropic ya ofrecen modos socráticos, pero el estudiante los apaga con un clic ([InfoQ](https://www.infoq.com/news/2025/08/study-mode-chatgpt)). La debilidad está en el incentivo, no en la técnica. Una solución diferenciadora tiene que vivir en la **evaluación** y en el **flujo del docente**, no ser otro tutor más.

### Hacia 2036: base débil y IA ubicua

Perú llega con una base frágil: alrededor del 70% está bajo el nivel 2 de matemática en PISA 2025 ([Caretas](https://caretas.pe/?p=832776)). Gerlich halla que un mayor nivel educativo protege del efecto negativo de la descarga cognitiva ([DOAJ](https://doaj.org/article/d5c17dd91ce64775a065095d8af730ce)). Hacia 2036, los agentes harán tareas completas y el producto escrito dejará de ser evidencia de aprendizaje. Ambos puntos son inferencias razonables para el pitch, no datos medidos en Perú.

| Paper o fuente clave | Hallazgo | Enlace |
|---|---|---|
| Bastani et al. (2025), PNAS | +48% en la práctica, −17% sin IA; las salvaguardas mitigan el daño | [Wharton](https://knowledge.wharton.upenn.edu/article/without-guardrails-generative-ai-can-harm-education/) |
| Anthropic Education Report (2025) | ~47% de conversaciones directas; Crear 39,8%, Analizar 30,2% | [Anthropic](https://www.anthropic.com/research/anthropic-education-report-how-university-students-use-claude) |
| Brookings Global Task Force (ene. 2026) | Riesgos > beneficios con el uso actual; "teach, not tell" | [PDF](https://webdocs.gmu.edu/wp-content/uploads/A-New-Direction-for-Students-in-an-AI-World.pdf) |
| OCDE Digital Education Outlook 2026 | Performance ≠ learning | [OCDE](https://www.oecd.org/en/publications/oecd-digital-education-outlook-2026_062a7394-en.html) |
| Kestin et al. (2025), Scientific Reports | Tutor IA pedagógico > aprendizaje activo (~2x) | [ETC Journal](https://etcjournal.com/2025/11/10/review-of-kestin-et-al-s-june-2025-harvard-study-on-ai-tutoring/) |
| De Simone et al., Banco Mundial (Nigeria) | 0,31 DE en 6 semanas con docente en el circuito | [Blog BM](https://blogs.worldbank.org/en/education/From-chalkboards-to-chatbots-Transforming-learning-in-Nigeria) |
| Kosmyna et al. (2025), MIT, preprint | Deuda cognitiva; "pensar primero, IA después" | [MIT](https://www.media.mit.edu/publications/your-brain-on-chatgpt/) |
| Lee et al. (2025), CHI | El pensamiento crítico se desplaza hacia verificar y supervisar | [Microsoft Research](https://www.microsoft.com/en-us/research/?p=1135061) |
| Gilley y Clarkston (2014) | Exámenes en dos etapas: más retención | [CWSEI](https://cwsei.ubc.ca/files/outcomes/EOY/Gilley-Clarkston_TwoStageExams_CWSEI-EOY2013.pdf) |
| U. de Auckland, evaluación oral interactiva | Evaluación percibida como más justa y notas menos infladas | [Auckland](https://www.auckland.ac.nz/en/news/2025/10/02/the-case-for-oral-exams-in-the-age-of-ai.html) |

## Grieta 03: una cohorte de 55+ sale antes de 2036 y el relevo no está listo

### La cuenta del relevo

La aritmética es simple y fuerte. El Censo Educativo 2025 registra **430.724 docentes públicos**, el 41% en zona rural ([ESCALE](https://escale.minedu.gob.pe/documents/inicio/Publicaciones/Boletin%20regional/Magnitudes-PERU.pdf)). El 22% de los docentes de secundaria tiene 55 años o más ([Gestión/OCDE](https://gestion.pe/economia/peru-1-de-cada-5-profesores-de-secundaria-tiene-55-anos-hay-personal-listo-para-el-relevo-noticia/)) y el cese obligatorio en la Carrera Pública Magisterial es a los 65 ([LP Derecho](https://lpderecho.pe/cese-limite-edad-docentes-65-anos-resolucion-002381-2021-servir-tsc/)). Esa cohorte sale prácticamente entera antes de 2036.

### El reemplazo no llega

El reemplazo no llega ni en cantidad ni en calidad. Pedagogía "nunca ha superado el 10% o 11%" de las becas estatales, según GRADE ([Gestión](https://gestion.pe/economia/peru-1-de-cada-5-profesores-de-secundaria-tiene-55-anos-hay-personal-listo-para-el-relevo-noticia/)). Menos del 30% de los 223 mil postulantes aprobó la Prueba Única Nacional de 2024 ([La República](https://larepublica.pe/sociedad/2024/09/14/menos-del-30-de-docentes-paso-prueba-de-nombramiento-953628)), y en 2022 quedaron sin adjudicar 33.022 plazas ([Congreso](https://www.congreso.gob.pe/Storage/tbl_notas_de_prensa/fld_121_PDF_file/2637-x5Ka0Mt0Hm3Uh9G.pdf)). La escasez es geográfica (rural, VRAEM, frontera, multigrado) y por especialidad: matemática y ciencias son las más golpeadas. La caída de la natalidad amortigua el total, pero no corrige la distribución.

### Qué funciona: subir el piso del docente novato

La tutoría y el coaching funcionan, pero pierden fuerza al escalar. El working paper de Kraft, Schueler y Falken (2024) agrega 265 RCT con un efecto de ~0,42 DE, que cae a entre un tercio y la mitad en programas grandes ([EdWorkingPapers](https://edworkingpapers.com/ai24-1031)). El coaching docente logra 0,49 DE en instrucción, con efectos dos a tres veces mayores en programas pequeños ([Kraft, Blazar y Hogan 2018](https://education.umd.edu/sites/default/files/uploads/inline-files/Kraft%20Blazar%20Hogan_2018_The%20Effect%20of%20Teacher%20Coaching_Review%20of%20Educational%20Research.pdf)). El Acompañamiento Pedagógico Multigrado del Perú mejoró prácticas, pero sus efectos sobre los aprendizajes se desvanecieron ([Minedu 2019](https://repositorio.minedu.gob.pe/handle/20.500.12799/6774)).

La IA con mejor evidencia **aumenta** al docente en lugar de reemplazarlo:

- **Tutor CoPilot** (RCT con 783 tutores) sugiere movimientos pedagógicos en tiempo real. Logró +4 pp de dominio, +9 pp con los tutores peor calificados, a ~US$20 por tutor al año ([J-PAL](https://www.povertyactionlab.org/evaluation/human-ai-cooperation-improve-tutoring-united-states)).
- El feedback automatizado sobre el "uptake" de ideas de los estudiantes lo subió 13% ([EdWorkingPapers](https://edworkingpapers.com/ai21-483)).
- ChatGPT con una guía redujo 31% el tiempo de planificación sin pérdida de calidad ([EEF](https://educationendowmentfoundation.org.uk/news/teachers-using-chatgpt-alongside-a-guide-to-support-them-to-use-it-effectively-can-cut-lesson-planning-time-by-over-30-per-cent)).

La tutoría telefónica de bajo costo replicó efectos de 0,30-0,35 DE en varios países a ~US$12 por niño ([BID](https://publications.iadb.org/en/africa-and-asia-successful-global-tutoring-experiences-connected)). El patrón es que lo que escala es el **andamiaje que sube el piso del menos experto**, y ese es justo el perfil del docente que relevará a la cohorte 55+. GRADE insiste en que el relevo requiere inducción y mentoría en los primeros años ([Gestión](https://gestion.pe/economia/peru-1-de-cada-5-profesores-de-secundaria-tiene-55-anos-hay-personal-listo-para-el-relevo-noticia/)).

| Paper o fuente clave | Hallazgo | Enlace |
|---|---|---|
| Wang, Demszky et al., Tutor CoPilot (RCT) | +4 pp de dominio; +9 pp con tutores débiles; ~US$20 por tutor al año | [J-PAL](https://www.povertyactionlab.org/evaluation/human-ai-cooperation-improve-tutoring-united-states) |
| Kraft, Schueler y Falken (working paper 2024) | 265 RCT, ~0,42 DE; cae a 1/3-1/2 a escala | [EdWorkingPapers](https://edworkingpapers.com/ai24-1031) |
| Kraft, Blazar y Hogan (2018), RER | Coaching: 0,49 DE en instrucción y 0,18 DE en logro | [PDF UMD](https://education.umd.edu/sites/default/files/uploads/inline-files/Kraft%20Blazar%20Hogan_2018_The%20Effect%20of%20Teacher%20Coaching_Review%20of%20Educational%20Research.pdf) |
| Demszky et al. (2023), M-Powering Teachers | +13% de uptake con feedback automatizado | [EdWorkingPapers](https://edworkingpapers.com/ai21-483) |
| EEF (2024), ChatGPT en la planificación | −31% de tiempo sin pérdida de calidad | [EEF](https://educationendowmentfoundation.org.uk/news/teachers-using-chatgpt-alongside-a-guide-to-support-them-to-use-it-effectively-can-cut-lesson-planning-time-by-over-30-per-cent) |
| Angrist, Bergman y Matsheng, tutoría telefónica | 0,30-0,35 DE; ~US$12 por niño | [BID](https://publications.iadb.org/en/africa-and-asia-successful-global-tutoring-experiences-connected) |
| Tusome / PRIMR (Kenia) | El paquete con guías estructuradas y coaching tuvo los mayores efectos | [Trialogue](https://trialogueknowledgehub.co.za/from-pilot-to-scale-how-kenya-built-a-national-literacy-programme-on-evidence/) |
| Minedu (2019), APM | Mejora prácticas; los aprendizajes se desvanecen | [Repositorio Minedu](https://repositorio.minedu.gob.pe/handle/20.500.12799/6774) |

## Grieta 04: 1,3 millones fuera, y casi la mitad sigue fuera al año siguiente

### El problema es un stock que se reproduce

El problema no es el flujo de entrada, sino un stock que se reproduce. Según el IEDEP-CCL con la ENAHO 2025, más de **1,3 millones** de jóvenes de 15 a 29 años (15%) no estudian ni trabajan, una cifra estancada desde 2021. El 63,5% son mujeres. La probabilidad anual de seguir siendo nini es **44%** (47% en mujeres), y vivir en convivencia suma 5,5 pp a esa persistencia ([La Cámara](https://lacamara.pe/poblacion-nini-2025-no-baja-de-los-1-3-millones/)). El 74% solo tiene educación básica y el 26% tiene educación superior pausada. Las regiones con mayor incidencia son Loreto (21,2%), Tumbes (20,7%) y Lambayeque (19,6%) ([La Cámara](https://lacamara.pe/?p=94263)).

### Antes de ser nini: deserción escolar y superior

Antes de llegar ahí está la deserción. Más del 30% de los mayores de 15 años no terminó la secundaria ([El Búho](https://elbuho.pe/?p=411682)), y no terminarla reduce en 20% la probabilidad de un empleo adecuado ([Edudatos 48](https://escale.minedu.gob.pe/documents/inicio/Analisis/Edudatos/Edudatos%2048%20-%20Policy%20brief%20Alerta%20temprana%20interrupcion%20de%20estudios.pdf)). En la educación superior, la ENAHO 2024 sugiere 29,5% de deserción universitaria y 45,2% en institutos ([Gestión](https://gestion.pe/peru/estudios-interrumpidos-las-carreras-universitarias-con-mayor-nivel-de-desercion-en-el-peru-noticia/)).

### El cuello de botella de Alerta Escuela es la acción, no el modelo

El Estado ya tiene un sistema de alerta temprana con machine learning, Alerta Escuela. Según el Banco Mundial, los directores lo usaron sobre todo para el reporte mensual, no para prevenir ([Banco Mundial](https://blogs.worldbank.org/en/education/early-warning-systems-can-help-prevent-dropouts-administrators-need-consider-critical)). Por eso un hackathon no debe proponer "otro modelo predictivo". La segunda oportunidad (EBA/CEBA) atiende a más de 180 mil personas ([El Peruano](https://elperuano.pe/noticia/268387-mas-de-180000-personas-retoman-sus-estudios-gracias-a-la-educacion-basica-alternativa)), una fracción del stock.

### Qué funciona: información y nudges en las transiciones

La evidencia favorece las intervenciones baratas en momentos de transición:

- **Información sobre retornos.** Jensen logró +0,20 a 0,35 años de escolaridad ([RePEc](https://ideas.repec.org/a/oup/qjecon/v125y2010i2p515-548..html)). En Perú, "Decidiendo para un Futuro Mejor" se escaló con el Minedu ([IPA](https://es.poverty-action.org/sites/default/files/publications/Peru-Country-Brief-Spanish-July-2019.pdf)).
- **SMS contra el summer melt.** +3,1 pp de matrícula a ~US$7 por estudiante ([NEBHE](https://www.nebhe.org/post/can-text-messages-mitigate-summer-melt)).
- **Indicadores simples.** El indicador on-track de Chicago predice mejor la graduación que los puntajes previos ([UChicago Consortium](https://consortium.uchicago.edu/sites/default/files/2018-10/p78.pdf)).

Hay dos advertencias de diseño. Las alertas ayudan poco a quienes ya llegan con señales de riesgo ([MDRC, Diplomas Now](https://www.mdrc.org/work/publications/addressing-early-warning-indicators)), y los nudges genéricos fallan a escala: no tuvieron efecto en 250 mil aprendices de edX ([EdSurge sobre Kizilcec et al.](https://edsurge.com/news/2020-06-17-massive-study-of-online-teaching-ends-with-surprising-and-deflating-result)). Para las madres jóvenes, el cuidado infantil es la palanca: +12 pp de trabajo materno en Nicaragua ([SUFE/JPubE](https://academicnewsletter.sufe.edu.cn/info/274299)).

### Hacia 2036: el argumento más débil del reto

Esta es la grieta con el argumento de crecimiento más débil. No hay una proyección cuantitativa de ninis al 2036. El caso descansa en tres piezas: el stock estancado, una persistencia de 44% que lo reproduce y la OIT vinculando parte del fenómeno con los cambios que la IA genera en el mercado laboral ([La Cámara](https://lacamara.pe/?p=98531)). El pitch debe reconocerlo y apoyarse en la persistencia como mecanismo.

| Paper o fuente clave | Hallazgo | Enlace |
|---|---|---|
| IEDEP-CCL (ENAHO 2025, prensa) | 1,3 millones; 63,5% mujeres; 44% de persistencia anual | [La Cámara](https://lacamara.pe/poblacion-nini-2025-no-baja-de-los-1-3-millones/) |
| Jensen (2010), QJE | La información sobre retornos sube la escolaridad 0,20-0,35 años | [RePEc](https://ideas.repec.org/a/oup/qjecon/v125y2010i2p515-548..html) |
| Castleman y Page, summer melt | SMS: +3,1 pp de matrícula a US$7 | [NEBHE](https://www.nebhe.org/post/can-text-messages-mitigate-summer-melt) |
| UChicago Consortium, Freshman OnTrack | Indicador simple que predice la graduación | [PDF](https://consortium.uchicago.edu/sites/default/files/2018-10/p78.pdf) |
| Banco Mundial sobre Alerta Escuela | Usado para reportar, no para prevenir | [Blog BM](https://blogs.worldbank.org/en/education/early-warning-systems-can-help-prevent-dropouts-administrators-need-consider-critical) |
| Heller et al., Becoming a Man | +12-19% de graduación con TCC grupal | [NBER](https://www.nber.org/papers/w21178) |
| Kizilcec et al. (2020), PNAS | Nudges sin efecto a escala | [EdSurge](https://edsurge.com/news/2020-06-17-massive-study-of-online-teaching-ends-with-surprising-and-deflating-result) |

## Factibilidad común: WhatsApp, datos abiertos y consentimiento

### Canal: el celular y WhatsApp

El canal está resuelto. El 89,2% de los usuarios de internet de 6 años o más se conecta por celular ([INEI](https://www.inei.gob.pe/media/MenuRecursivo/boletines/boletin-tic-oct_dic2025.pdf)) y WhatsApp está en el 98,6% de los usuarios de mensajería ([Expreso/ERESTEL](https://www.expreso.com.pe/actualidad/whatsapp-y-yape-lideran-el-uso-digital-en-peru-segun-erestel-2025-noticia/1291271/)). Los mensajes de servicio dentro de la ventana de 24 horas que abre el usuario son gratis ([Meta Developers](https://developers.facebook.com/docs/whatsapp/pricing)). Por eso conviene que el usuario inicie la conversación con un QR o un enlace wa.me.

### Stack para un día

El stack de un día que comparten las propuestas es:

- Next.js en Vercel como PWA liviana.
- Supabase (Postgres con auth OTP).
- La API de un LLM rápido para diagnóstico y clasificación con salida JSON.
- El webhook de WhatsApp Cloud API o el sandbox de Twilio, con la versión web como respaldo, porque la verificación de número de Meta puede tardar.

### Datos abiertos

Hay datos abiertos suficientes:

- **Anthropic Economic Index** en HuggingFace: tareas O*NET con su porcentaje de automatización frente a aumento ([HuggingFace](https://www.huggingface.co/datasets/Anthropic/EconomicIndex/blob/ed82ec6d3701b067db983405b214fc0d6fa580f2/onet_task_mappings.csv)).
- **Índice de exposición de la OIT** por ISCO-08.
- **ENAHO** y **ESCALE**.

Falta verificar el crosswalk entre la CIUO peruana e ISCO-08 y la licencia del índice de Anthropic.

### Privacidad y menores

El reglamento de la Ley 29733 (DS 016-2024-JUS) rige desde el 30 de marzo de 2025. Según una fuente secundaria, los jóvenes de 14 a 18 años pueden consentir por sí mismos ([modelo.pe](https://modelo.pe/carta-de-consentimiento-informado-para-tratamiento-de-datos-personales-de-menores-de-edad/)). Hay que confirmarlo en el texto oficial. La regla del reto es más estricta: con menores, un adulto presente y ninguna recolección de datos personales. Todas las propuestas con escolares usan IDs seudónimos y no piden nombre, DNI ni teléfono del menor.

## Dieciséis propuestas que no son chatbot, detector ni bolsa de empleo

Cada propuesta replica un mecanismo con evidencia causal y lo traslada al contexto peruano. El criterio de exclusión de los organizadores sirve de filtro: ninguna entrega respuestas finales, ninguna juzga si se usó IA y ninguna se limita a listar vacantes. Las métricas propuestas son de diseño propio; los resultados citados pertenecen a los estudios originales.

### P1. Primer Encargo Verificable

| Campo | Contenido |
|---|---|
| Grieta | 01 |
| Problema y dato | Las firmas dejaron de contratar juniors (−9-10% en firmas adoptantes; [SSRN](https://www.alejandrobarros.com/wp-content/uploads/2025/11/ssrn-5425555.pdf)). En Perú, la informalidad juvenil es 85,3% ([Gestión](https://gestion.pe/economia/en-menores-de-25-anos-la-informalidad-es-de-85-este-seria-el-panorama-hacia-el-2030-precariedad-laboral-desempleo-juvenil-mercado-laboral-noticia/)) |
| Evidencia | Pallais (2014): contratación y evaluación detallada mejoran el empleo posterior; Carranza et al.: los certificados suman +5 pp de empleo |
| Lo no obvio | No intermedia vacantes. Fabrica la **información sobre el novato** que el mercado no produce: micro-encargos de 5-10 h de mypes y ONG con una rúbrica estructurada de 5 dimensiones que se publica como credencial verificable con QR |
| MVP en 1 día | Next.js + Supabase; formulario de encargo, entrega por enlace, rúbrica, perfil público con QR (hash firmado) |
| Usuario a validar | 1 mype o ONG que publica un encargo real y 2-3 estudiantes que lo entregan durante el hackathon |
| Métrica | % con segundo encargo o empleo a los 60-90 días frente a una lista de espera; tasa de respuesta de postulaciones con y sin credencial |
| Adoptante y modelo | Gratis para el joven; la mype paga el encargo (S/ 100-300) y la plataforma retiene una comisión, como Parker Dewey (~10%; [Parker Dewey](https://www.parkerdewey.com/pricing)); licencia a oficinas de empleabilidad universitarias |
| Riesgos | Se puede percibir como "otro marketplace". Hay que defenderlo por la rúbrica y la credencial. Pocas mypes al inicio; calidad desigual de los evaluadores |

### P2. Supervisa a la IA (simulador de puesto junior con errores sembrados)

| Campo | Contenido |
|---|---|
| Grieta | 01 |
| Problema y dato | Las ocupaciones más expuestas en Perú son técnicos administrativos, contables y legales ([La República/INEI](https://larepublica.pe/economia/2025/12/02/contabilidad-administracion-programacion-y-otras-carreras-en-que-la-ia-generativa-pondria-en-riesgo-segun-el-inei-evat-22490)); el empleo de 14-24 años en Lima cayó 9,5% en 2025 ([Infomercado](https://infomercado.pe/inei-reporta-que-el-empleo-juvenil-en-lima-cayo-9-5-durante-el-2025/)) |
| Evidencia | "Canaries": la caída ocurre donde la IA automatiza, no donde aumenta ([Stanford DEL](https://digitaleconomy.stanford.edu/publications/canaries-in-the-coal-mine)); Lee et al.: la habilidad clave pasa a ser verificar y supervisar ([Microsoft Research](https://www.microsoft.com/en-us/research/?p=1135061)); Pallais, por el reporte detallado |
| Lo no obvio | Entrena al joven para el lado de "aumento" que no cae. Simula una semana de un técnico contable o legal, donde un "colega IA" entrega trabajo con **errores sembrados** que el joven debe detectar y corregir. El resultado es un reporte de desempeño estandarizado, no un curso |
| MVP en 1 día | 3 casos (conciliación bancaria, contrato, informe) con una clave de errores; un LLM como colega; corrección automática contra la clave; reporte en PDF |
| Usuario a validar | 3-5 estudiantes de contabilidad o derecho y 1 reclutador o jefe de área que valore el reporte |
| Métrica | % de errores detectados (pre y post), tiempo por caso; preferencia del reclutador por candidatos con reporte frente a sin reporte |
| Adoptante y modelo | Institutos y universidades pagan una licencia por cohorte; empleadores patrocinan casos de su sector (modelo Forage: estudiantes gratis, ingresos de empleadores; [EAB](https://eab.com/about/newsroom/press/forage-job-simulations-surpass-10-million-student-engagements/)) |
| Riesgos | Sin validación de que el reporte prediga el desempeño laboral; producir casos realistas cuesta; el hackathon solo permite casos sintéticos |

### P3. Radar de Exposición de mi Carrera

| Campo | Contenido |
|---|---|
| Grieta | 01 |
| Problema y dato | Desajuste ocupacional del 60,7% en recién egresados ([PUCP](https://repositorio.pucp.edu.pe/index/handle/123456789/167991)); Mi Carrera supera 3,6 millones de consultas, pero muestra sueldos pasados ([El Peruano](https://elperuano.pe/noticia/295979-plataforma-mi-carrera-supero-los-36-millones-de-consultas-sobre-vocacion-profesional)) |
| Evidencia | Índice OIT WP140 por ISCO-08; Anthropic Economic Index por tarea (automatización frente a aumento); Jensen: la información sobre retornos cambia decisiones |
| Lo no obvio | Los portales estatales miran hacia atrás (sueldos). Este mira hacia adelante: qué **tareas** de la ocupación destino ya automatiza la IA y cuáles aumenta, con una ruta de 3 micro-habilidades. No se encontró nada equivalente en Perú |
| MVP en 1 día | Pipeline precomputado O*NET → ISCO-08 → JSON estático; dashboard en Next.js; recomendador por reglas |
| Usuario a validar | 5 estudiantes de 5.º de secundaria o del primer ciclo (con un adulto presente si son menores; sin datos personales) |
| Métrica | % que cambia su plan de cursos o prácticas; % que completa una micro-habilidad a 30 días |
| Adoptante y modelo | B2G: módulo para Ponte en Carrera (Pronabec, MTPE, IPAE; [Andina](https://andina.pe/agencia/noticia-portal-ponte-carrera-actualiza-su-informacion-736855.aspx)) o Mi Carrera; colegios privados y preuniversitarias |
| Riesgos | El crosswalk entre la CIUO peruana e ISCO-08 no está verificado; los datos de tareas son de EE. UU.; riesgo de que se lea como "test vocacional" |

### P4. Defiéndelo (defensa oral asistida por IA del trabajo propio)

| Campo | Contenido |
|---|---|
| Grieta | 02 |
| Problema y dato | 95% de los universitarios usa IA y solo 41% lo hace de forma efectiva; 80% teme acusaciones de plagio ([El Peruano](https://elperuano.pe/noticia/277486-como-se-usa-inteligencia-artificial-en-la-educacion-superior)); ~47% de las conversaciones son directas ([Anthropic](https://www.anthropic.com/research/anthropic-education-report-how-university-students-use-claude)) |
| Evidencia | El grupo LLM no podía citar su propio ensayo ([MIT](https://www.media.mit.edu/publications/your-brain-on-chatgpt/)); la evaluación oral se percibe como más justa ([Auckland](https://www.auckland.ac.nz/en/news/2025/10/02/the-case-for-oral-exams-in-the-age-of-ai.html)); ICAP: explicar es constructivo |
| Lo no obvio | No detecta IA: mide si el estudiante **entiende lo que entregó**. La IA genera 3-5 preguntas específicas sobre *su* trabajo, el estudiante responde por voz en 5 minutos y el docente recibe una rúbrica con fragmentos citados como evidencia. Así resuelve que la evaluación oral no escala con 40 o más estudiantes por docente |
| MVP en 1 día | Next.js + Web Speech API o Whisper + LLM (generador de preguntas y calificador con rúbrica en JSON) + panel docente |
| Usuario a validar | 5-10 estudiantes PUCP con un trabajo real y 1 docente que revise los reportes, en el mismo hackathon |
| Métrica | "Brecha de comprensión" (nota escrita menos nota de defensa); minutos de docente ahorrados frente a un oral presencial; acuerdo entre el docente y la IA (kappa) |
| Adoptante y modelo | Universidades: licencia por curso o estudiante, vendida a las unidades de innovación docente; encaja con los lineamientos de IA de la UPC ([UPC](https://innovacioneducativa.upc.edu.pe/wp-content/uploads/2025/02/LINEAMIENTOS_PARA_EL_USO_DE_HERRAMIENTAS_DE_INTELIGENCIA_ARTIFICIAL_GENERATIVA_EN_EL_PROCESO_DE_ENSENANZA_%E2%80%93_APRENDIZAJE_Y_ASSESSMENT.pdf)) |
| Riesgos | Ansiedad oral; sesgo contra estudiantes con menos fluidez verbal; voz como dato personal (transcribir sin guardar audio); calidad del speech-to-text con acentos regionales |

### P5. Mapa de Malentendidos

| Campo | Contenido |
|---|---|
| Grieta | 02 (con efecto sobre la 03) |
| Problema y dato | ~70% bajo el nivel 2 de matemática en PISA 2025 ([Caretas](https://caretas.pe/?p=832776)); solo 21% de los docentes se siente preparado para la IA ([El Peruano](https://elperuano.pe/noticia/277486-como-se-usa-inteligencia-artificial-en-la-educacion-superior)) |
| Evidencia | Brookings: usar la IA para diagnosticar ([PDF](https://webdocs.gmu.edu/wp-content/uploads/A-New-Direction-for-Students-in-an-AI-World.pdf)); Nigeria: docente en el circuito ([BM](https://blogs.worldbank.org/en/education/From-chalkboards-to-chatbots-Transforming-learning-in-Nigeria)); práctica de recuperación |
| Lo no obvio | La IA no le habla al estudiante. Los estudiantes responden 3 preguntas abiertas **sin IA**; el LLM agrupa las respuestas por **concepción errónea** (no por correcto o incorrecto) y sugiere al docente una pregunta discriminante para la clase siguiente |
| MVP en 1 día | Formulario por QR + LLM con salida JSON (cluster, concepción errónea, IDs) + dashboard de barras |
| Usuario a validar | 1 docente de secundaria con su aula (respuestas anónimas, docente presente) o una sección universitaria |
| Métrica | % que supera la concepción errónea en la pregunta de seguimiento; acuerdo docente-IA en la clasificación; minutos de corrección ahorrados |
| Adoptante y modelo | Freemium para docentes; licencia para redes de colegios privados y UGEL; ONG educativas como piloto |
| Riesgos | Errores de agrupamiento; letra manuscrita en zonas sin dispositivos; el docente debe actuar sobre el diagnóstico (el mismo cuello de botella de Alerta Escuela) |

### P6. Primero Tú (falla productiva con IA bloqueada hasta el intento)

| Campo | Contenido |
|---|---|
| Grieta | 02 |
| Problema y dato | La IA sin salvaguardas deja un −17% de aprendizaje sin IA ([Wharton](https://knowledge.wharton.upenn.edu/article/without-guardrails-generative-ai-can-harm-education/)); el Study Mode se apaga con un clic ([InfoQ](https://www.infoq.com/news/2025/08/study-mode-chatgpt)) |
| Evidencia | GPT Tutor frente a GPT Base (Bastani); falla productiva ~0,36 DE ([Sinha y Kapur](https://doi.org/10.3102/00346543211019105)); "pensar primero" (Kosmyna) |
| Lo no obvio | El **docente** configura la secuencia y es obligatoria: primero un intento con nivel de confianza (1-5), luego un diagnóstico del error, una sola pista, una explicación con sus palabras y una recuperación espaciada a los 3 días. Registra la **calibración** (confianza frente a acierto), que ataca la ilusión de comprensión |
| MVP en 1 día | SPA con 10 problemas preuniversitarios + LLM con escalera de pistas + Supabase |
| Usuario a validar | 6-10 estudiantes en un mini A/B (Primero Tú frente a chat libre) durante el hackathon |
| Métrica | Puntaje en una prueba sin IA (inmediata y a 3-7 días); error de calibración; pistas usadas por problema |
| Adoptante y modelo | Academias preuniversitarias y colegios privados (licencia por alumno); B2G para refuerzo escolar |
| Riesgos | Es el más cercano a "otro tutor"; el pitch debe centrarse en la secuencia obligatoria y la calibración. Los estudiantes pueden abrir ChatGPT en otra pestaña |

### P7. Bitácora de Pensamiento (evaluación del proceso, no del producto)

| Campo | Contenido |
|---|---|
| Grieta | 02 |
| Problema y dato | ~47% de las interacciones son directas ([Anthropic](https://www.anthropic.com/research/anthropic-education-report-how-university-students-use-claude)); "passenger mode" (Brookings) |
| Evidencia | Taxonomía de Anthropic de interacciones directas frente a colaborativas; Lee et al. sobre la supervisión de tareas; ICAP |
| Lo no obvio | La IA está permitida y es transparente. Un editor con IA integrada clasifica cada pedido (directo o colaborativo, por nivel de Bloom) y genera un **perfil de delegación** que ven el docente y el estudiante. Se califica *cómo* se usó la IA |
| MVP en 1 día | TipTap + panel de chat + clasificador LLM de prompts + log de pegados y tiempos + dashboard |
| Usuario a validar | 3-5 estudiantes escribiendo un ensayo corto y 1 docente |
| Métrica | Cambio en la proporción de pedidos directos frente a colaborativos a lo largo de 2-4 tareas; correlación del perfil con una prueba sin IA |
| Adoptante y modelo | Universidades (complemento de la plataforma LMS); integración con Canvas o Moodle |
| Riesgos | Se puede percibir como vigilancia; los estudiantes eluden el editor; el clasificador puede equivocarse |

### P8. Copiloto de Tutoría (Tutor CoPilot en español)

| Campo | Contenido |
|---|---|
| Grieta | 03 |
| Problema y dato | 22% de los docentes de secundaria con 55+ y cese a los 65 ([Gestión](https://gestion.pe/economia/peru-1-de-cada-5-profesores-de-secundaria-tiene-55-anos-hay-personal-listo-para-el-relevo-noticia/)); menos del 30% aprueba la PUN ([La República](https://larepublica.pe/sociedad/2024/09/14/menos-del-30-de-docentes-paso-prueba-de-nombramiento-953628)): los relevos serán novatos |
| Evidencia | Tutor CoPilot: +4 pp, +9 pp con tutores débiles, ~US$20 por tutor al año ([J-PAL](https://www.povertyactionlab.org/evaluation/human-ai-cooperation-improve-tutoring-united-states)); la tutoría pierde efecto a escala por la calidad del tutor ([Kraft et al., WP 2024](https://edworkingpapers.com/ai24-1031)) |
| Lo no obvio | La IA no le habla al estudiante, sino al **docente novato**. Este pega la respuesta errónea y recibe 2-3 movimientos pedagógicos (pregunta guía, pista, ejemplo), nunca la respuesta. Sube el piso del menos experto, que es el perfil del relevo |
| MVP en 1 día | Web y WhatsApp + LLM con un repertorio de estrategias + banco de 20 ítems alineados al CNEB + registro de exit tickets |
| Usuario a validar | 2-3 practicantes de Pedagogía o docentes novatos con ejercicios reales |
| Métrica | % de exit tickets aprobados (con y sin copiloto); tasa de "respuesta regalada"; costo por sesión |
| Adoptante y modelo | UGEL y DRE (formación en servicio), facultades de Educación, ONG de tutoría |
| Riesgos | Conectividad rural; adopción docente; evidencia solo de EE. UU.; verificar la inconsistencia 66% frente a 56% del resumen de J-PAL |

### P9. Planificador Multigrado Estructurado

| Campo | Contenido |
|---|---|
| Grieta | 03 |
| Problema y dato | 41% de los docentes públicos es rural ([ESCALE](https://escale.minedu.gob.pe/documents/inicio/Publicaciones/Boletin%20regional/Magnitudes-PERU.pdf)); escuelas multigrado con un solo docente ([Energiminas/Defensoría](https://energiminas.com/2026/07/06/dia-del-maestro-57-de-las-escuelas-rurales-publicas-necesita-ser-reemplazadas/)) |
| Evidencia | −31% de tiempo de planificación ([EEF](https://educationendowmentfoundation.org.uk/news/teachers-using-chatgpt-alongside-a-guide-to-support-them-to-use-it-effectively-can-cut-lesson-planning-time-by-over-30-per-cent)); guías estructuradas tipo Tusome ([Trialogue](https://trialogueknowledgehub.co.za/from-pilot-to-scale-how-kenya-built-a-national-literacy-programme-on-evidence/)) |
| Lo no obvio | No es un "generador de sesiones" genérico. Produce una **guía con guion por grado simultáneo** para el aula multigrado, que es el formato que más funcionó en Kenia, y funciona offline como PWA |
| MVP en 1 día | Formulario (grados, área, competencia CNEB) → sesión en formato Minedu en PDF; PWA cacheada |
| Usuario a validar | 1-2 docentes rurales o multigrado por videollamada |
| Métrica | Minutos de planificación por sesión; % de sesiones adoptadas; calidad según la rúbrica de un especialista |
| Adoptante y modelo | Minedu o DRE (B2G); ONG rurales |
| Riesgos | **Innovación baja**: existen muchos generadores de planes. La evidencia mide tiempo, no aprendizaje; riesgo de alucinar competencias del CNEB |

### P10. Radar del Relevo (proyección de vacantes por UGEL y especialidad)

| Campo | Contenido |
|---|---|
| Grieta | 03 |
| Problema y dato | 33.022 plazas sin adjudicar en 2022 ([Congreso](https://www.congreso.gob.pe/Storage/tbl_notas_de_prensa/fld_121_PDF_file/2637-x5Ka0Mt0Hm3Uh9G.pdf)); Pedagogía ≤10-11% de las becas |
| Evidencia | Cohorte 55+ y cese a los 65; escasez concentrada en matemática, ciencias y zonas rurales |
| Lo no obvio | Cruza la salida por edad con la oferta de aprobados de la PUN y de egresados de Pedagogía por UGEL y especialidad para focalizar becas y plazas **antes** de que se abra el hueco |
| MVP en 1 día | Streamlit + CSV de ESCALE + modelo de cohortes (años hasta los 65) + mapa |
| Usuario a validar | 1 planificador de UGEL o DRE, o un investigador de GRADE |
| Métrica | Precisión del backtest; UGEL en "alerta roja"; uso para decisiones de focalización |
| Adoptante y modelo | Minedu, Pronabec (B2G); consultoría |
| Riesgos | **No está verificado que los microdatos de edad por UGEL sean descargables**: puede ser inviable en un día. Es un dashboard y no tiene un usuario final claro para la prueba |

### P11. Ruta de Regreso (reenganche de ninis por WhatsApp)

| Campo | Contenido |
|---|---|
| Grieta | 04 |
| Problema y dato | 1,3 millones de ninis; 44% de persistencia anual; 74% solo con básica ([La Cámara](https://lacamara.pe/poblacion-nini-2025-no-baja-de-los-1-3-millones/)) |
| Evidencia | SMS contra el summer melt: +3,1 pp a US$7 ([NEBHE](https://www.nebhe.org/post/can-text-messages-mitigate-summer-melt)); Alerta Escuela no ve a quien ya salió del sistema |
| Lo no obvio | Llega a quien el sistema ya no ve. Con 5 preguntas anónimas (edad, región, nivel, si cuida a alguien) recomienda una ruta concreta (un CEBA nocturno, un instituto, Jóvenes Productivos) y envía recordatorios de fechas de matrícula. Segmenta a las madres cuidadoras frente a los jóvenes en transición |
| MVP en 1 día | Árbol de decisión + JSON de CEBA y oferta + WhatsApp (Twilio sandbox) + web de respaldo |
| Usuario a validar | 2-3 jóvenes de 18-29 años fuera del sistema (por ejemplo, vía una municipalidad o una ONG) |
| Métrica | Conversión del embudo (ruta recomendada → clic → intención de matrícula a 30 días) |
| Adoptante y modelo | Municipalidades distritales, SENAJU, MTPE (B2G); patrocinio de institutos privados por referido |
| Riesgos | Conseguir un usuario real nini en 48 horas; la calidad del catálogo de oferta; los nudges genéricos fallan a escala ([Kizilcec](https://edsurge.com/news/2020-06-17-massive-study-of-online-teaching-ends-with-surprising-and-deflating-result)) |

### P12. Alerta a Acción (capa de acción sobre el riesgo escolar)

| Campo | Contenido |
|---|---|
| Grieta | 04 |
| Problema y dato | Alerta Escuela se usó para reportar, no para prevenir ([Banco Mundial](https://blogs.worldbank.org/en/education/early-warning-systems-can-help-prevent-dropouts-administrators-need-consider-critical)); más del 30% de los mayores de 15 años sin secundaria completa |
| Evidencia | Chicago on-track ([Consortium](https://consortium.uchicago.edu/sites/default/files/2018-10/p78.pdf)); Diplomas Now: 75% frente a 68% de alumnos sin alertas en 6.º grado ([MDRC](https://www.mdrc.org/work/publications/addressing-early-warning-indicators)) |
| Lo no obvio | No propone otro modelo predictivo. Convierte la alerta en un **plan de acción con seguimiento** para el tutor, con un indicador explicable en lugar de una caja negra |
| MVP en 1 día | CSV con IDs seudónimos → indicador on-track → plantillas de acción → registro de seguimiento |
| Usuario a validar | 1 tutor o director de secundaria con datos sintéticos o seudonimizados (adulto, sin datos personales) |
| Métrica | % de estudiantes en riesgo con una acción registrada en 2 semanas; cambio en el indicador on-track en el bimestre |
| Adoptante y modelo | Redes de colegios privados; UGEL (B2G) |
| Riesgos | Duplica parcialmente una herramienta estatal; datos de menores; los alumnos que ya llegan en alerta necesitan apoyo intensivo, no solo una alerta |

### P13. Pausa, no Abandono (retención en educación superior)

| Campo | Contenido |
|---|---|
| Grieta | 04 |
| Problema y dato | Deserción de 29,5% en universidades y 45,2% en institutos (ENAHO 2024, [Gestión](https://gestion.pe/peru/estudios-interrumpidos-las-carreras-universitarias-con-mayor-nivel-de-desercion-en-el-peru-noticia/)); 26% de los ninis tiene superior pausada |
| Evidencia | Castleman y Page (mensajes en las transiciones); Chicago on-track |
| Lo no obvio | Ofrece alternativas a la salida definitiva: reprogramar pagos, una licencia en lugar de un retiro o un traslado. El objetivo es convertir el abandono en una pausa con fecha de regreso |
| MVP en 1 día | Dataset sintético + reglas o regresión logística + mensajes simulados + panel institucional |
| Usuario a validar | 1 coordinador de bienestar estudiantil de un instituto o universidad |
| Métrica | Tasa de rematrícula A/B; % de retiros convertidos en licencias |
| Adoptante y modelo | Institutos y universidades privadas (cada alumno retenido es ingreso por pensiones): un business case claro |
| Riesgos | Los datos institucionales son privados; existen soluciones de analítica de retención comerciales (sus precios no se verificaron) |

### P14. Tutores del Relevo (combinación 01 + 02 + 03)

| Campo | Contenido |
|---|---|
| Grieta | 01, 02 y 03 |
| Problema y dato | Faltan docentes de matemática y ciencias en zonas rurales ([Gestión/OCDE](https://gestion.pe/economia/peru-1-de-cada-5-profesores-de-secundaria-tiene-55-anos-hay-personal-listo-para-el-relevo-noticia/)); ~70% bajo el nivel 2 en matemática; los universitarios no consiguen experiencia verificable (60,7% de desajuste) |
| Evidencia | Tutoría telefónica: 0,30-0,35 DE a ~US$12 por niño ([BID](https://publications.iadb.org/en/africa-and-asia-successful-global-tutoring-experiences-connected)); Tutor CoPilot (+9 pp con tutores débiles); Pallais y Carranza (evaluación más credencial) |
| Lo no obvio | Un solo producto cierra tres grietas. Universitarios de STEM o Pedagogía dan tutoría remota a escolares de zonas con déficit, **con un docente de aula presente**. Un copiloto le sugiere al tutor movimientos pedagógicos y nunca la respuesta. Cada sesión deja un exit ticket y una evaluación del docente supervisor que forman un **portafolio verificable** para el primer empleo del tutor. La IA no reemplaza al docente que falta: multiplica a los tutores novatos que pueden cubrirlo |
| MVP en 1 día | Next.js + Supabase + LLM copiloto (prompt de estrategias) + banco de ítems CNEB + exit ticket + perfil del tutor con credencial QR; videollamada o WhatsApp externos |
| Usuario a validar | 1-2 universitarios PUCP como tutores y 1 escolar con su docente o padre presente (sin datos personales del menor; ID seudónimo) |
| Métrica | Exit tickets aprobados con y sin copiloto; tasa de "respuesta regalada"; para el tutor, invitaciones a entrevista con y sin portafolio |
| Adoptante y modelo | UGEL y DRE en zonas de déficit pagan por sesión o por estudiante (referencia de ~US$12 por niño); universidades lo usan para prácticas o responsabilidad social; empresas patrocinan por RSE y reclutan a los tutores con mejor evaluación |
| Riesgos | Coordinar horarios entre escuela y universidad; caída del efecto a escala (Kraft); salvaguarda de menores; retención de tutores voluntarios; conectividad |

### P15. Portafolio Defendido (combinación 01 + 02)

| Campo | Contenido |
|---|---|
| Grieta | 01 y 02 |
| Problema y dato | Los empleadores ya no pueden confiar en un portafolio hecho con IA; las firmas recortan la contratación junior ([Stanford DEL](https://digitaleconomy.stanford.edu/publications/canaries-in-the-coal-mine)) |
| Evidencia | Certificados de habilidad: +11% de invitaciones a entrevista ([VoxDev](https://www.voxdev.org/topic/labour-markets/reducing-labour-market-information-frictions-skill-certificates-evidence-south)); evaluación oral ([Auckland](https://www.auckland.ac.nz/en/news/2025/10/02/the-case-for-oral-exams-in-the-age-of-ai.html)) |
| Lo no obvio | Usa el motor de Defiéndelo para el mercado laboral. El candidato sube un proyecto, lo defiende ante preguntas generadas sobre ese proyecto y recibe una credencial que dice "entiende y puede explicar lo que construyó". Convierte la desconfianza en una señal verificable |
| MVP en 1 día | El mismo de P4 + página pública de la credencial con transcripción resumida |
| Usuario a validar | 3 egresados recientes y 1 reclutador que compare credenciales |
| Métrica | Preferencia del reclutador; tasa de invitación a entrevista (mini estudio de auditoría) |
| Adoptante y modelo | Gratis para el candidato; las empresas pagan por verificación o por acceso al pool de candidatos; universidades por egresado |
| Riesgos | El empleador debe confiar en la credencial; el candidato puede ensayar respuestas preparadas por IA |

### P16. Encargo de Regreso (combinación 01 + 04)

| Campo | Contenido |
|---|---|
| Grieta | 01 y 04 |
| Problema y dato | 26% de los ninis tiene superior pausada ([La Cámara](https://lacamara.pe/?p=94263)); 63,5% son mujeres, muchas con carga de cuidado |
| Evidencia | Pallais (primer encargo con evaluación); cuidado infantil y trabajo flexible ([SUFE/JPubE](https://academicnewsletter.sufe.edu.cn/info/274299)) |
| Lo no obvio | Usa micro-encargos remunerados y remotos de 2-5 horas como **puerta de reenganche** compatible con el cuidado. Cada encargo con buena evaluación desbloquea una ruta de retorno a estudios (CEBA, instituto) |
| MVP en 1 día | El P1 vía WhatsApp + el árbol de rutas de P11 |
| Usuario a validar | 1-2 jóvenes ninis de 18+ (vía una ONG o municipalidad) y 1 mype |
| Métrica | % que completa un encargo; % que inicia una matrícula a 60 días |
| Adoptante y modelo | Municipalidades y programas de empleo (B2G); mypes pagan los encargos |
| Riesgos | Doble marketplace (oferta y demanda) difícil de arrancar; la evidencia de que el encargo lleve a la matrícula es una hipótesis |

## La tabla comparativa favorece las combinaciones con prueba en vivo

Los puntajes (1 a 5) son un juicio propio basado en la evidencia anterior. La columna ponderada aplica los pesos de la rúbrica (30/30/20/20) y se expresa sobre 100. "Problema" valora la fuerza del dato peruano y del paper. "Innovación" valora qué tan lejos está de las categorías descartadas y de lo que ya existe. "Técnica" valora si se puede desplegar en un día con datos disponibles. "Pitch" valora la claridad del adoptante y del modelo de ingresos.

| # | Propuesta | Grieta | Problema y evidencia (30%) | Innovación (30%) | Técnica (20%) | Pitch y negocio (20%) | Total /100 |
|---|---|---|---|---|---|---|---|
| P14 | Tutores del Relevo | 01+02+03 | 5 | 5 | 4 | 5 | **96** |
| P4 | Defiéndelo | 02 | 5 | 4 | 5 | 4 | **90** |
| P2 | Supervisa a la IA | 01 | 4 | 5 | 4 | 4 | **86** |
| P8 | Copiloto de Tutoría | 03 | 5 | 4 | 4 | 4 | 86 |
| P15 | Portafolio Defendido | 01+02 | 4 | 5 | 4 | 4 | 86 |
| P5 | Mapa de Malentendidos | 02 | 4 | 4 | 5 | 4 | 84 |
| P1 | Primer Encargo Verificable | 01 | 5 | 3 | 4 | 4 | 80 |
| P6 | Primero Tú | 02 | 5 | 3 | 5 | 3 | 80 |
| P11 | Ruta de Regreso | 04 | 5 | 3 | 4 | 4 | 80 |
| P3 | Radar de Exposición | 01 | 4 | 4 | 3 | 4 | 76 |
| P7 | Bitácora de Pensamiento | 02 | 4 | 4 | 4 | 3 | 76 |
| P13 | Pausa, no Abandono | 04 | 4 | 3 | 4 | 4 | 74 |
| P9 | Planificador Multigrado | 03 | 4 | 2 | 5 | 4 | 72 |
| P16 | Encargo de Regreso | 01+04 | 4 | 4 | 3 | 3 | 72 |
| P12 | Alerta a Acción | 04 | 4 | 3 | 4 | 3 | 70 |
| P10 | Radar del Relevo | 03 | 4 | 3 | 2 | 3 | 62 |

El patrón es claro. Las propuestas que **aumentan a un humano** (tutor, docente, evaluador) y producen una **señal verificable** puntúan mejor que las que informan (radares) o predicen (alertas). Las primeras tienen RCT detrás, prueba en vivo posible y un comprador que paga por un resultado. Las de la grieta 04 tienen el mejor dato de problema, pero sufren en innovación, porque ya existen Alerta Escuela, Mi Carrera y los nudges, y en la prueba con usuario real, porque conseguir un nini en 48 horas es difícil.

## Las tres apuestas recomendadas

### 1. Tutores del Relevo: la única que cierra tres grietas con un solo flujo

Esta es la apuesta principal. Su narrativa es potente: la IA destruye el primer peldaño de los universitarios, vacía el aprendizaje de los escolares y la docencia pierde a su cohorte mayor. En lugar de competir con el docente, la IA **convierte a los universitarios novatos en tutores competentes**, que es justo lo que muestra Tutor CoPilot: el mayor beneficio aparece en los tutores menos expertos ([J-PAL](https://www.povertyactionlab.org/evaluation/human-ai-cooperation-improve-tutoring-united-states)). Esa experiencia queda registrada como evidencia evaluada, que es lo que Pallais muestra que el mercado no produce por sí solo ([Pallais](https://pallais.scholars.harvard.edu/publications/inefficient-hiring-entry-level-labor-markets)).

Resiste los cuatro filtros de los organizadores. No da respuestas, porque el copiloto le habla al tutor. No detecta nada. No es una bolsa de empleo, porque produce una credencial evaluada y no lista vacantes. Y no es ChatGPT con otro nombre, porque el valor está en el flujo humano y la señal. Para validar con un usuario real se necesita un universitario tutor y un escolar acompañado por su docente o padre, sin datos personales.

### 2. Defiéndelo: la de prueba más limpia

Es la más fácil de probar con rigor en el propio evento. Hay decenas de estudiantes PUCP con trabajos reales, la métrica ("brecha de comprensión" entre la nota escrita y la defensa oral) se calcula en vivo y el comprador, la universidad, existe y ya está escribiendo lineamientos de IA. Su extensión natural, **Portafolio Defendido (P15)**, lleva el mismo motor al mercado laboral y suma la grieta 01 al business case sin construir otro producto.

### 3. Supervisa a la IA: la más alineada con el mecanismo de "Canaries"

Es la respuesta más precisa al mecanismo de la grieta 01: si los empleos de entrada caen donde la IA automatiza y no donde aumenta ([Stanford DEL](https://digitaleconomy.stanford.edu/publications/canaries-in-the-coal-mine)), hay que entrenar y certificar el aumento, es decir, la capacidad de detectar y corregir los errores de la IA ([Lee et al.](https://www.microsoft.com/en-us/research/?p=1135061)). La validación es directa: estudiantes de contabilidad o derecho, más un reclutador que compare reportes.

### Si el equipo quiere atacar la grieta 04

Si el equipo prefiere la grieta 04, **Ruta de Regreso (P11)** es la opción más sólida. Conviene asegurar desde ya el acceso a jóvenes reales a través de una municipalidad o una ONG, porque sin esa prueba la propuesta pierde puntos en el criterio de validación.

## Verificar antes del pitch

| Qué verificar | Por qué importa | Dónde |
|---|---|---|
| Si el reto permite combinar grietas o exige elegir una | Define si Tutores del Relevo es elegible tal cual o debe presentarse como grieta 03 con beneficios secundarios | Bases del DSC HACK 2026 y consulta a los organizadores |
| Tasas de éxito de Tutor CoPilot (66% frente a 56% en un resumen; usar 4 pp) | Es la cifra central de P8 y P14 | Paper original, enlazado desde [J-PAL](https://www.povertyactionlab.org/evaluation/human-ai-cooperation-improve-tutoring-united-states) |
| Estado de publicación del meta-análisis de Kraft | Citarlo como working paper de 2024 salvo confirmación | [EdWorkingPapers](https://edworkingpapers.com/ai24-1031) |
| "87 mil formados" frente a inscritos, y la fecha de la nota de La República | Corregir la cifra del reto | [Minedu](https://www.gob.pe/institucion/minedu/noticias/1164507-minedu-capacita-a-mas-de-87-000-docentes-en-inteligencia-artificial-en-el-ambito-nacional) |
| Fecha y fuente del 24,1% del INEI (Infobae 26/09/2026 no ubicado) | Atribuir al estudio de diciembre de 2025 | [El Peruano](https://elperuano.pe/noticia/284173-inei-que-trabajos-podrian-ser-reemplazados-por-la-automatizacion-y-la-ia-generativa-en-el-peru) |
| El +127% de GPT Tutor en Bastani | Cifra secundaria; no usarla sin leer el paper | [PNAS vía RePEc](https://ideas.repec.org/a/nas/journl/v122y2025pe2422633122.html) |
| Política de IA de la PUCP | Un hackathon en la PUCP; Defiéndelo debe encajar con ella | Dirección Académica del Profesorado, PUCP |
| Artículo del DS 016-2024-JUS sobre menores y transferencia internacional de datos a APIs de LLM | La fuente actual es secundaria | El Peruano, ANPD |
| Crosswalk CIUO Perú ↔ ISCO-08 y licencia del Anthropic Economic Index | Condiciona la viabilidad de P3 | INEI; dataset card en HuggingFace |
| Descarga de microdatos de edad docente por UGEL | Condiciona la viabilidad de P10 | ESCALE / Censo Educativo |
| Informe original del IEDEP sobre ninis 2025 | Todas las cifras vienen de prensa de la CCL | IEDEP-CCL |
| Cifras de Perú en el informe BID sobre PISA 2025 y uso de IA | El PDF devolvió 403 | [BID](https://publications.iadb.org/publications/spanish/document/PISA-en-America-Latina-y-el-Caribe-2025-Como-usan-la-IA-los-estudiantes-de-America-Latina-y-que-tan-preparadas-estan-sus-escuelas.pdf) |
| Tiempos de aprobación del número de WhatsApp en Meta | Llevar Twilio sandbox o la web como respaldo | [Meta Developers](https://developers.facebook.com/docs/whatsapp/pricing) |

## Conclusión

Las cuatro grietas parecen problemas distintos (empleo, aprendizaje, docencia, exclusión), pero la evidencia revela una sola falla de fondo: la IA generativa elimina los momentos de **esfuerzo supervisado** en los que alguien novato se vuelve competente y demuestra que lo es, sea el junior que hacía tareas de entrada, el estudiante que se equivocaba antes de entender o el docente nuevo que aprendía de uno mayor. Por eso las soluciones ganadoras no son "IA para la educación" en abstracto. Son IA que **devuelve la dificultad productiva y la hace visible**: un copiloto que le habla al tutor y no al alumno, una defensa oral que mide comprensión en lugar de sospechar fraude, un simulador que certifica la supervisión de la IA en lugar de competir con ella.

La implicación práctica para el hackathon es que la métrica de impacto siempre debe medirse **sin la IA**: aprendizaje sin el asistente, desempeño del tutor sin la sugerencia, empleabilidad con una señal frente a sin ella. Ese es el estándar que separa los estudios que funcionaron de los que solo mejoraron la tarea. Un equipo que muestre esa diferencia con un usuario real, aunque sea con cinco personas, tendrá algo que casi ningún producto edtech actual puede mostrar.
