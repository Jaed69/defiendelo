# Panorama competitivo, datos abiertos y factibilidad técnica — DSC HACK 2026 "Educación 2036" (PUCP, 29-31 oct 2026)

Notas de investigación (fecha de corte: 2026-10-30). Fuentes verificadas vía búsqueda web; donde la fuente es secundaria o hay conflicto, se indica. Lo no verificable está en "Gaps".

## 1. Evidencia de las brechas y soluciones existentes (Perú/LatAm/global) — qué dejan sin cubrir

### Takeaway
Cada brecha tiene evidencia cuantitativa citable para Perú (ninis ~17%, informalidad juvenil ~85%, docentes con edad promedio ~50 años en el sector público, estudiantes que piden "respuestas directas" a la IA casi la mitad del tiempo) y una evidencia global de que la IA erosiona el primer empleo (-13% relativo en 22-25 años en ocupaciones expuestas, EE. UU.). Los competidores cubren información (Ponte en Carrera, Mi Carrera), cursos (Crehana, Platzi), alerta temprana administrativa (Alerta Escuela) o experiencia simulada pagada por empleadores globales (Forage, Parker Dewey), pero ninguno integra: exposición a IA por ocupación peruana + prueba de habilidades "sin IA" + puente a experiencia real local, ni opera por WhatsApp para población fuera del sistema.

### Cited Findings

**Brecha A — Erosión del primer empleo por IA**
- Brynjolfsson, Chandar y Chen (Stanford, ago 2025), con datos de nómina ADP: trabajadores de 22-25 años en las ocupaciones más expuestas a IA tuvieron una caída relativa de ~13% en empleo, aun controlando shocks a nivel de firma; los trabajadores mayores en las mismas ocupaciones no cayeron; la caída se concentra donde la IA *automatiza* más que *aumenta*. Los autores advierten que no es prueba causal. — [SIEPR Stanford](https://siepr.stanford.edu/publications/working-paper/canaries-coal-mine-six-facts-about-recent-employment-effects-artificial)
- Una fuente secundaria reporta ~6% si se mide de fines de 2022 a julio 2025 (cifras varían con la ventana). — [Benton](https://www.benton.org/headlines/canaries-coal-mine-six-facts-about-recent-employment-effects-artificial-intelligence)
- OIT WP140 (mayo 2025): 1 de cada 4 trabajadores en el mundo está en una ocupación con alguna exposición a GenAI; 3,3% del empleo global está en la categoría de máxima exposición; 11% del empleo en países de ingreso bajo vs 34% en ingreso alto; las ocupaciones administrativas/oficinistas (clerical) son las más expuestas; máxima exposición 4,7% en mujeres vs 2,4% en hombres; la OIT insiste en que exposición ≠ pérdida de empleo (transformación es lo más probable). — [OIT Research Brief 2025](https://www.ilo.org/pt-pt/publications/generative-ai-and-jobs-2025-update); [OIT WP140 PDF](https://www.developmentaid.org/api/frontend/cms/file/2025/05/WP140_web.pdf)
- Perú: informalidad en jóvenes de 14-24 años que trabajan = 85,3% (vs 67,0% en 25-44). — [Gestión](https://gestion.pe/economia/en-menores-de-25-anos-la-informalidad-es-de-85-este-seria-el-panorama-hacia-el-2030-precariedad-laboral-desempleo-juvenil-mercado-laboral-noticia/); [Caretas](https://caretas.pe/economia/empleo-informal-alcanza-mas-del-85-de-jovenes-peruanos-menores-de-25-anos-como-abordar-esta-situacion)
- Desempleo juvenil Perú: cifras dispares según rango y periodo: 9,0% (14-24, III trim 2025); 10,9%→11,8% (15-24, 2024→2025, citando OIT); 13,8%→14,3% (2023→2024, INEI en prensa). Desempleo nacional cerró 2025 en 4,9%. — [Gestión](https://gestion.pe/economia/desempleo-en-peru-mas-de-1-millon-sin-trabajo-y-los-jovenes-no-se-salvaron-empleo-trabajo-inei-puestos-de-trabajo-en-peru-buscar-empleo-noticia/); [Infobae](https://www.infobae.com/peru/2025/09/05/crecen-los-emprendimientos-juveniles-en-peru-en-medio-de-la-alta-tasa-de-desempleo-y-la-informalidad-laboral/); [Buk](https://www.buk.pe/blog/desempleo-juvenil-peru) (cifras no directamente comparables entre sí)
- IPE: 160 mil jóvenes menos trabajando entre 2019 y 2024. — [Lampadia/IPE](https://lampadia.com/opiniones/ipe/hay-160-mil-jovenes-menos-trabajando-entre-el-2019-y-2024)
- CEPLAN advierte brechas persistentes en empleo juvenil y calidad laboral. — [El Peruano](https://www.elperuano.pe/noticia/294768-dia-del-trabajo-ceplan-advierte-brechas-persistentes-en-empleo-juvenil-y-calidad-laboral-en-el-peru)

**Brecha B — Aprender con IA sin pensar**
- Anthropic Education Report (abr 2025): análisis de 1 millón de conversaciones anonimizadas de estudiantes universitarios en Claude.ai; según cobertura secundaria, por taxonomía de Bloom: Crear 39,8%, Analizar 30,2%, Aplicar 10,9%, Comprender 10,0%; Anthropic escribió: "This raises questions about ensuring students don't offload critical cognitive tasks to AI systems". Casi la mitad de las interacciones eran pedidos de respuesta directa con mínimo ida y vuelta. Informática sobrerrepresentada (~37-39% de usuarios según la fuente). — [Anthropic](https://www.anthropic.com/research/anthropic-education-report-how-university-students-use-claude); [The Decoder](https://the-decoder.com/students-delegate-higher-level-thinking-to-ai-anthropic-study-finds/); [Hechinger Report](https://hechingerreport.org/proof-points-offload-critical-thinking-ai)
- Anthropic publicó en ago 2025 un segundo reporte: "How Educators Use Claude". — [InfoDocket](https://www.infodocket.com/2025/08/26/just-released-anthropic-education-report-how-educators-use-claude/)

**Brecha C — Docentes envejecidos sin reemplazo**
- Ley de Reforma Magisterial (29944, reglamento): retiro obligatorio el 31 dic del año en que el docente cumple 65 años (con posibilidad de extender hasta 5 años según documento del Congreso, texto fragmentario). — [Congreso PL 5747](https://www.congreso.gob.pe/Docs/comisiones2024/Educacion/files/exp._pl_5747_cong._tello.montes.pdf)
- Total docentes (Minedu/INEI 2025 citado en proyecto de ley): 548 621. — [Congreso PL 5747](https://www.congreso.gob.pe/Docs/comisiones2024/Educacion/files/exp._pl_5747_cong._tello.montes.pdf)
- IPAE: edad promedio de docentes del sector público ≈ 50 años. — [IPAE, Medidas urgentes formación inicial docente](https://www.ipae.pe/wp-content/uploads/2023/01/Propuesta-Educacion-MEDIDAS-URGENTES-PARA-MEJORAR-LA-FORMACION-INICIAL.pdf)
- INEI (vía El Peruano, año del estudio incierto): 25,7% de docentes tiene 50-59 años y 9,2% más de 60. — [El Peruano](https://elperuano.pe/noticia/99188-inei-el-929-de-los-docentes-en-el-peru-hacen-uso-de-internet)
- Universidades: >50% de docentes universitarios con 50+ años (2019); en públicas, 24,3% con 65+. — [Consorcio Umbral](https://consorcio.edu.pe/umbral/wp-content/uploads/2023/07/BOLETIN-INFORMATIVO-N°-12-UMBRAL.pdf); [UPCH Spirat](https://revistas.upch.edu.pe/index.php/Spirat/article/download/5754/6833/36175)
- SUTEP estima déficit de 60 000 profesores en colegios públicos (Amazonas, Madre de Dios, Loreto) — estimación sindical sin fecha clara. — [El Búho](https://elbuho.pe/?p=401772)
- Proyecto de ley propone bajar edad de retiro (55 mujeres / 60 hombres); no confirmado si se aprobó. — [Congreso PL 5686](https://www.leyes.congreso.gob.pe/Documentos/2016_2021/Proyectos_de_Ley_y_de_Resoluciones_Legislativas/Proyectos_Firmas_digitales/PL05686.pdf)

**Brecha D — Ninis**
- INEI (informe ago 2025, vía PerúCheck): 17,4% de jóvenes 15-29 años ni estudia ni trabaja en 2024 (~1,4 millones); 2020 llegó a 26,6%. Otras cifras 2024: 16,1%, 17,3% (El Búho), 15,6% (IEDEP-CCL). — [El Búho](https://elbuho.pe/?p=424867); [CCL](https://lacamara.pe/poblacion-nini-se-redujo-45-en-2024-y-alcanza-a-un-millon-170-mil-jovenes/?print=pdf); [Forbes Perú](https://forbes.pe/economia-y-finanzas/2025-05-13/poblacion-nini-en-peru-se-redujo-45-en-2024-suman-mas-de-11-millon-de-jovenes/)
- ALERTA metodológica: desde 2024 Perú dejó de contar como ninis a quienes buscan trabajo, lo que reduce la cifra oficial. — [La República](https://larepublica.pe/economia/2025/07/05/el-pais-de-los-ninis-mas-de-15-millones-de-jovenes-fuera-del-estudio-y-del-trabajo-hnews-473445)
- IEDEP-CCL: ninis 2025 > 1,3 millones (15-29), estancado desde 2021; Loreto la tasa más alta (21,2%). — [CCL](https://lacamara.pe/poblacion-nini-2025-no-baja-de-los-1-3-millones/)
- INEI: 5,7% de adolescentes 14-17 son ninis (IV trim 2025); 336 000 jóvenes de 14-17 no estudian. — [Gestión](https://gestion.pe/economia/mas-alla-del-pisa-336000-jovenes-entre-14-y-17-anos-en-peru-no-estudian-que-riesgos-hay-noticia/)
- Informe "Juventud en Cifras" (SENAJU, oct 2025) disponible como fuente oficial. — [SENAJU](https://juventud.gob.pe/wp-content/uploads/2025/10/JUVENTUD-EN-CIFRAS-FINAL-dl-1.pdf)

**Soluciones existentes y su límite**
- *Ponte en Carrera* (desde 2015; Minedu vía Pronabec + MTPE + IPAE): información de universidades/institutos, ingresos promedio por carrera (p. ej. Medicina, Ing. Telecomunicaciones, Agronegocios S/ 3 964-4 072/mes); ingresos de técnicos desde Planilla Electrónica 2020 / Padrón de Egresados 2017-2019 (datos rezagados). — [Andina](https://andina.pe/agencia/noticia-portal-ponte-carrera-actualiza-su-informacion-736855.aspx); [PDF oficial](https://ponteencarrera.minedu.gob.pe/pec-portal-web/assets/archivos/cuanto-ganan-tecnicos.pdf)
- *Mi Carrera* (MTPE, dic 2023): test vocacional, sueldos desde Planilla Electrónica, "Carreras del Futuro"; >3,6 millones de consultas. — [El Peruano](https://elperuano.pe/noticia/295979-plataforma-mi-carrera-supero-los-36-millones-de-consultas-sobre-vocacion-profesional); [Gestión](https://gestion.pe/peru/aplicativo-mi-carrera-del-mtpe-ofrece-test-vocacional-informacion-de-sueldos-y-opciones-de-becas-noticia/)
- *Alerta Escuela* (Minedu, oct 2020, vía SIAGIE): directores registran mensualmente riesgo de interrupción por estudiante; obligatorio desde lineamientos 2021; cubre EBR y EBE pública y privada. Es una herramienta administrativa para directores, no para el joven ya fuera del sistema. — [gob.pe Minedu](https://www.gob.pe/institucion/minedu/noticias/306531-minedu-implementa-alerta-escuela-un-sistema-de-alerta-temprana-para-identificar-estudiantes-con-riesgo-de-abandonar-el-sistema-educativo); [ESCALE Edudatos 48](https://escale.minedu.gob.pe/documents/inicio/Analisis/Edudatos/Edudatos%2048%20-%20Policy%20brief%20Alerta%20temprana%20interrupcion%20de%20estudios.pdf)
- *Laboratoria*: estudiantes no pagan durante el programa y pagan (subsidiado, en cuotas) solo tras conseguir empleo tech; costo ~US$2 500 por estudiante; empresas participan como donantes, empleadoras o clientes de servicios; empleabilidad reportada 75% (2026, meta 85%) u >83% (fuente sin fecha); lanzó "Activa tu carrera" porque la IA obligó a repensar el bootcamp. — [Portafolio](https://www.portafolio.co/negocios/empresas/mujeres-tras-las-vacantes-de-la-economia-digital-559116); [ProActivo](https://proactivo.com.pe/laboratoria-vuelve-a-la-carga-y-proyecta-llegar-a-colombia/); [Crehana blog](https://www.crehana.com/blog/negocios/que-es-laboratoria/); [Emprendedor](https://emprendedor.com/laboratoria-mexico-impulsa-mujeres-stem-ursula-quijano/)
- *Forage* (adquirida por EAB en abr 2024): simulaciones de trabajo gratuitas para estudiantes, 2-3 h, sin notas; los empleadores pagan por crear/alojar; >10 millones de participaciones (ago 2025); 100+ empleadores, 300+ simulaciones (Citi, Goldman, KPMG, BCG); EAB afirma que empresas tienen >2x probabilidad de contratar a quien hizo la simulación (dato no verificado independientemente). — [EAB](https://eab.com/about/newsroom/press/forage-job-simulations-surpass-10-million-student-engagements/); [Campus Technology](https://campustechnology.com/Articles/2024/04/23/EAB-to-Acquire-Job-Simulation-Company-Forage.aspx); [Hechinger](https://hechingerreport.org/unsure-about-a-career-try-one-in-a-job-simulation-program/)
- *Parker Dewey* (micro-internships): proyectos de US$200-600, 90% va al estudiante; promedio US$222,22 por proyecto de 10 h; cuenta y publicación gratis para empleadores; pago fijo por entrega, preseteado a US$20/h estimada; no pueden ser no remuneradas; sin fee por contratación posterior. — [Parker Dewey Pricing](https://www.parkerdewey.com/pricing); [Knowledge Base](https://www.parkerdewey.com/help/knowledge-base/micro-intern-payments-info-for-employers)
- *Handshake*: lanzó Handshake AI (ene 2025), marketplace de etiquetado/entrenamiento de IA con su red de estudiantes y PhDs; Sacra estimó ~US$280M anualizados en ago 2025 (US$200M job board + US$80M AI); reportes de abr 2026 hablan de ~US$1 000M brutos anualizados en AI training (net ~US$300-450M, conflicto entre fuentes); adquirió Uplimit (jun 2026). Señal: el mercado de "primer empleo" de jóvenes calificados se está desplazando hacia trabajo de entrenamiento de IA. — [Sacra](https://sacra.com/research/handshake); [Josh Bersin](https://joshbersin.com/2026/06/handshake-acquires-uplimit-ai-skilling-takes-a-new-direction/); [KuCoin news](https://kucoin.com/news/flash/handshake-ai-training-business-nears-10b-annual-revenue-in-2026) (fuente débil)
- *Khanmigo*: única cifra hallada es de un calculador de terceros (~US$4/mes tier pagado); sin confirmación oficial de precio distrital. — [Toolradar](https://toolradar.com/tools/khanmigo/calculator)

### Inferences
- Hueco de innovación más defendible: los portales estatales (Ponte en Carrera, Mi Carrera) muestran *sueldos pasados por carrera*, no *exposición futura a IA de las tareas* de esa ocupación en Perú. Cruzar ocupaciones peruanas (CIUO/ISCO-08) con el índice OIT y las tareas del Anthropic Economic Index permitiría decirle a un joven "estas tareas de tu carrera ya se automatizan; estas son las que la IA aumenta" — no existe en Perú según lo hallado.
- Forage/Parker Dewey prueban que el modelo "gratis para el joven, paga el empleador" funciona, pero dependen de empleadores grandes globales y salario de EE. UU.; un análogo peruano con mypes/ONG locales y micro-proyectos de S/ 100-300 es un modelo diferente (no "otro job board").
- Alerta Escuela detecta riesgo *dentro* de la escuela; los ninis ya están *fuera*. Un canal WhatsApp de reenganche/derivación (municipalidades, SENAJU) ataca lo que el sistema no ve.
- Para la brecha B, el insight de Anthropic (casi 50% pedidos directos) sostiene una herramienta que *no responde* sino que diagnostica qué no se entendió (alineado con lo que piden los organizadores). Khanmigo hace tutoría socrática, pero en inglés/EE. UU., de pago y sin currículo peruano (CNEB) — inferencia, no verificado.
- Para la brecha C, proyección simple: si la edad promedio pública es ~50 y el retiro es a 65, una gran cohorte se retira antes de 2036 (argumento de crecimiento al 2036). Requiere confirmar distribución por edad con el Censo Educativo/Nexus.

### Gaps
- No se verificaron modelos/precios de Crehana, Platzi, Duolingo, MagicSchool, Brisk, Riipen, Bumeran/Computrabajo, Talento Digital ni Khanmigo distrital (búsquedas no arrojaron fuentes primarias).
- No hay cifra oficial única y actualizada de docentes de EBR mayores de 50 años ni de déficit oficial Minedu; usar Censo Educativo / Nexus (ESCALE).
- Evidencia peruana directa del efecto de IA sobre el primer empleo no encontrada; solo evidencia EE. UU. + exposición OIT.

## 2. Fuentes de datos abiertos utilizables en Perú

### Takeaway
Hay suficiente para un MVP basado en datos: Anthropic Economic Index (tareas O*NET, abierto en HuggingFace), índice OIT de exposición por ISCO-08 a 4 dígitos (anexo del WP140), ENAHO/INEI (ninis, TIC, empleo), ESCALE (Censo Educativo, Alerta Escuela), Ponte en Carrera/Mi Carrera (sueldos por carrera, aunque no confirmados como dataset descargable).

### Cited Findings
- Anthropic Economic Index en HuggingFace (`Anthropic/EconomicIndex`): releases 2025-02-10 (mapeo a tareas O*NET, automatización vs aumentación), 2025-03-27 y 2025-09-15; `onet_task_mappings.csv` con descripción de tarea y % de conversaciones; `automation_vs_augmentation_by_task.csv`. Metodología: Handa et al. (2025) y Clio (Tamkin et al. 2024). Licencia: conflicto (CC-BY-4.0 según paquete R; MIT según tags de HF) — revisar dataset card. — [HuggingFace](https://www.huggingface.co/datasets/Anthropic/EconomicIndex/blob/ed82ec6d3701b067db983405b214fc0d6fa580f2/onet_task_mappings.csv); [CRAN aieconindex](https://cran.r-project.org/web/packages/aieconindex/index.html)
- OIT WP140: puntajes de exposición a nivel ISCO-08 (con anexo a 4 dígitos); basado en 29 753 tareas de la clasificación polaca, encuesta a 1 640 trabajadores, predicciones de GPT-4o/Gemini y panel de expertos; cuatro gradientes de exposición; media 0,29 (vs 0,30 en 2023). — [OIT WP140](https://www.ilo.org/es/node/706766); [PDF](https://www.developmentaid.org/api/frontend/cms/file/2025/05/WP140_web.pdf)
- INEI TIC trimestral (2025): boletines IV trim 2025 y III trim 2025 publicados. — [INEI boletín oct-dic 2025](https://www.inei.gob.pe/media/MenuRecursivo/boletines/boletin-tic-oct_dic2025.pdf); [INEI III trim 2025](https://www.inei.gob.pe/media/MenuRecursivo/boletines/tic-iii-trimestre_2025_1.pdf)
- ESCALE (Minedu): Edudatos 48 sobre alerta temprana de interrupción de estudios. — [ESCALE](https://escale.minedu.gob.pe/documents/inicio/Analisis/Edudatos/Edudatos%2048%20-%20Policy%20brief%20Alerta%20temprana%20interrupcion%20de%20estudios.pdf)
- Ponte en Carrera y Mi Carrera se construyen con Planilla Electrónica (MTPE) y Padrón de Egresados (Minedu); no se encontró confirmación de descarga como dataset abierto. — [Andina](https://andina.pe/ingles/noticia-plataforma-mi-carrera-del-mtpe-supera-medio-millon-consultas-987935.aspx); [PDF Ponte en Carrera](https://ponteencarrera.minedu.gob.pe/pec-portal-web/assets/archivos/cuanto-ganan-tecnicos.pdf)
- SENAJU "Juventud en Cifras" (oct 2025). — [SENAJU](https://juventud.gob.pe/wp-content/uploads/2025/10/JUVENTUD-EN-CIFRAS-FINAL-dl-1.pdf)

### Inferences
- Pipeline factible en horas: O*NET-SOC → ISCO-08 (crosswalk público de BLS/O*NET) → CIUO usada por INEI/MTPE → unir puntaje OIT + % automatización/aumentación de Anthropic por tarea. Precomputar a JSON estático (no requiere base de datos en vivo).
- ENAHO microdatos (módulos de empleo, educación, TIC) permiten segmentar ninis por región/edad para el argumento "crece al 2036", combinado con proyecciones poblacionales INEI.

### Gaps
- No se verificaron URLs/actualización de datosabiertos.gob.pe, SUNEDU (licenciamiento, grados), Observatorio Socio Económico Laboral (OSEL) del MTPE, ni Pronabec (becarios) como datasets descargables — verificar en el portal directamente.
- No se encontró el crosswalk oficial CIUO-Perú ↔ ISCO-08 publicado por INEI; presumiblemente la CIUO 2015 de INEI se basa en ISCO-08 (no verificado).
- Licencia exacta del Anthropic Economic Index (MIT vs CC-BY-4.0).

## 3. Modelos de negocio y posibles adoptantes

### Takeaway
Los modelos con tracción probada son "gratis para el joven, paga el empleador/institución" (Forage, Parker Dewey), "paga solo si consigues empleo" (Laboratoria, ISA subsidiado) y B2G vía programas estatales con millones de consultas (Mi Carrera). En Perú los compradores lógicos son oficinas de empleabilidad universitarias, Pronabec (que ya opera Ponte en Carrera), MTPE, SENAJU/municipios y ONG.

### Cited Findings
- Forage: ingresos 100% de empleadores; estudiantes gratis. — [Simplify/Forage](https://simplify.jobs/c/Forage); [LSUA](https://www.lsua.edu/news/2023/04/25/forage-arrives-to-central-louisiana-through-lsua)
- Parker Dewey: empleador paga por proyecto (US$200-600), plataforma retiene ~10%; universidades y asociaciones sin fines de lucro como canal de partners. — [Parker Dewey Pricing](https://www.parkerdewey.com/pricing); [Nonprofit Partnerships PDF](https://info.parkerdewey.com/hubfs/Association%20Partnership%20Docs/Parker%20Dewey%20Nonprofit%20Partnerships.pdf)
- Laboratoria: asociación civil; ingresos por donantes, empleadores y servicios de innovación a empresas; repago de estudiantes tras empleo; >800 empresas contratantes. — [Expansión](https://expansion.mx/emprendedores/2018/10/19/las-3-prioridades-de-la-nueva-directora-de-laboratoria-en-cdmx); [Crehana blog](https://www.crehana.com/blog/negocios/que-es-laboratoria/)
- Ponte en Carrera es operado por Minedu vía Pronabec con MTPE e IPAE → adoptante institucional natural para integrar datos de exposición a IA. — [Andina](https://andina.pe/agencia/noticia-portal-ponte-carrera-actualiza-su-informacion-736855.aspx)
- Mi Carrera (MTPE) >3,6 millones de consultas: hay demanda estatal de orientación vocacional digital. — [El Peruano](https://elperuano.pe/noticia/295979-plataforma-mi-carrera-supero-los-36-millones-de-consultas-sobre-vocacion-profesional)
- Handshake monetiza la red de estudiantes vendiendo trabajo experto a laboratorios de IA (~US$1 000M brutos anualizados reportados en 2026). — [Sacra](https://sacra.com/research/handshake)

### Inferences
- Pitch B2B2C sugerido: universidad/instituto paga licencia por cohorte (oficina de empleabilidad / acreditación SINEACE que exige seguimiento de egresados — no verificado); empleadores mypes pagan micro-proyectos; joven gratis.
- B2G: integración como módulo en Mi Carrera/Ponte en Carrera o en programas municipales de juventud (piloto con una municipalidad distrital es realista como "adoptante" en el pitch).
- Para docentes (brecha C): comprador = UGEL/DRE o Minedu (formación en servicio); ONG como Enseña Perú como piloto.

### Gaps
- No se obtuvieron precios B2B de Crehana/Platzi Business ni tarifas de contratos B2G en Perú; no se verificó modelo de Enseña Perú ni presupuestos de programas como Jóvenes Productivos/Trabaja Perú.

## 4. Stack rápido para MVP desplegado en 1 día y conectividad en Perú

### Takeaway
El celular es el canal dominante: 89,2% de usuarios de internet (6+) se conecta por celular y 91,3% de la población 6+ usa celular; WhatsApp está en el 98,6% de usuarios de mensajería. Un MVP web móvil liviano + WhatsApp (mensajes de servicio dentro de la ventana de 24 h son gratis) es factible en un día.

### Cited Findings
- INEI IV trim 2025: 96,2% de hogares accede a al menos una TIC; 89,2% de usuarios de internet de 6+ años lo hace por celular. — [INEI boletín TIC oct-dic 2025](https://www.inei.gob.pe/media/MenuRecursivo/boletines/boletin-tic-oct_dic2025.pdf)
- 98,4% de hogares de Lima Metropolitana con telefonía móvil (IV trim 2025; 97,0% en 2024). — [El Peruano](https://elperuano.pe/noticia/292141-lima-metropolitana-el-984-de-hogares-conto-con-telefonia-movil-durante-cuarto-trimestre-de-2025)
- 91,3% de la población de 6+ años usó celular (III trim 2025). — [Panamericana citando INEI](https://panamericana.pe/tecnologia/464480-inei-hombres-ligeramente-internet-mujeres/amp)
- Hogares con conexión a internet ~57,4% (dato INEI de año anterior, citado por CCL/Andina). — [CCL](https://lacamara.pe/el-574-de-hogares-del-peru-tiene-conexion-a-internet/); [Andina](https://andina.pe/agencia/noticia-inei-mas-del-57-hogares-el-peru-cuentan-internet-912038.aspx)
- OSIPTEL ERESTEL 2025: mensajería instantánea 68,6% de penetración; WhatsApp 98,6% de usuarios de mensajería; 80,9% lo usa principalmente con familia/amigos. (ERESTEL reporta "96% de hogares con acceso a internet", métrica distinta a ENAHO — no mezclar.) — [Expreso](https://www.expreso.com.pe/actualidad/whatsapp-y-yape-lideran-el-uso-digital-en-peru-segun-erestel-2025-noticia/1291271/); [Caretas](https://caretas.pe/?p=811042); [TeleSemana](https://www.telesemana.com/blog/2026/05/19/el-96-de-los-hogares-de-peru-tiene-acceso-a-internet-y-mejora-la-percepcion-general-hacia-los-servicios-de-telecomunicaciones/)
- WhatsApp Business Platform: desde 1 jul 2025 cobro por mensaje de plantilla entregado (no por conversación); precio según categoría (marketing, utility, authentication) y país; mensajes de servicio dentro de la ventana de 24 h iniciada por el usuario son gratis; Meta actualiza tarifas trimestralmente. — [Meta Developers](https://developers.facebook.com/docs/whatsapp/pricing)
- Referencia regional (no Perú): Argentina ~US$0,0299 utility / 0,0699 marketing; Brasil ~US$0,0078 / 0,0719 (mediados 2026, proveedor tercero). — [SleekFlow](https://help.sleekflow.io/en_US/whatsapp/pricing)

### Inferences
- Arquitectura sugerida 1 día: Next.js en Vercel (PWA ligera, sin imágenes pesadas) + Supabase (Postgres + auth por magic link/OTP) + API de Claude (modelo rápido/barato para diagnóstico) + webhook de WhatsApp (Meta Cloud API directo o Twilio sandbox para la demo). Precomputar datos de exposición a JSON estático.
- Diseñar el flujo para que el usuario *inicie* la conversación (código QR / link wa.me) → todo cae en mensajes de servicio gratuitos; evitar plantillas de marketing.
- Riesgo de demo: la verificación de número/negocio de Meta puede tardar; para el hackathon usar número de prueba de Meta (limitado a destinatarios registrados) o sandbox de Twilio, y tener la versión web como respaldo.
- Bajo ancho de banda: respuestas cortas en texto, notas de voz opcionales, sin video; funciona con datos limitados.

### Gaps
- Tarifa oficial WhatsApp para Perú (fila de país) no verificada; consultar rate card de Meta.
- Límites actuales de free tier de Vercel/Supabase y tiempos de aprobación de número de Meta no verificados en esta ronda.
- Penetración de smartphone (vs celular básico) por región rural no encontrada; GSMA no consultado.

## 5. Ética y privacidad: Ley 29733 y menores

### Takeaway
La Ley 29733 (Protección de Datos Personales) rige; su nuevo reglamento (DS 016-2024-JUS) entró en vigor el 30 mar 2025. Según fuente secundaria, menores de 14 años requieren consentimiento de padres/tutores; de 14 a 18 pueden consentir por sí mismos. Para un MVP con jóvenes 15-29 esto simplifica, pero debe haber consentimiento informado explícito y minimización de datos.

### Cited Findings
- Reglamento DS 016-2024-JUS vigente desde el 30 mar 2025; para menores, consienten padres/tutores salvo los de 14 a 18 años, que pueden consentir por sí mismos. — [modelo.pe](https://modelo.pe/carta-de-consentimiento-informado-para-tratamiento-de-datos-personales-de-menores-de-edad/) (fuente comercial secundaria; verificar texto oficial en El Peruano / ANPD)

### Inferences
- Prácticas mínimas para el MVP y prueba con usuario real: consentimiento informado (texto claro, en el primer mensaje de WhatsApp), no recolectar DNI salvo necesidad, filtrar a ≥14 años (o pedir autorización parental si hay menores), anonimizar transcripciones antes de enviarlas a un LLM externo, informar la transferencia internacional de datos (servidores del proveedor LLM fuera de Perú), y política de borrado.
- Datos de rendimiento académico o vulnerabilidad (ninis, deserción) pueden considerarse sensibles en contexto; tratar como tales.
- Evitar decisiones automatizadas con efectos (p. ej., "no apto"): presentar como orientación con humano en el circuito.

### Gaps
- No se verificó el artículo exacto del DS 016-2024-JUS sobre menores, ni obligaciones de inscripción de bancos de datos ante la ANPD, ni reglas de transferencia transfronteriza (flujo internacional) aplicables a APIs de LLM.
- No se verificaron las condiciones de uso de proveedores LLM respecto a menores (edad mínima de usuarios finales).
