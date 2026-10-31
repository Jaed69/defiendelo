# Producción igual al Pencil
Objective: bring production (defiendelo/) in line with design/defiendelo-flujo.pen, with synthetic data and no waits.
Branch: feat/produccion-pencil · Delivery: single-pr (user standing pattern "push y merge") · Runner: `npx vitest run` in defiendelo/

## Specs
- S1 (L1) "usa todo lo que hemos planteado para hacer la producción, modifica lo que haya que modificar, para que tenga lógica de funcionamiento, con lo que mostramos en el pencil"
- S2 (L1) "el flujo debe ser claro"
- S3 (L1) "usará la data sintética, tanto en la entrega como para la creación de tarea, o sea podemos simular todo"
- S4 (L1) "acorta los tiempos de carga, o quítalo porque no permiten la correcta exposición"
- S5 (L1) "debe ser lo más parecido al pencil"

## Tasks
- T1 S1,S5 visual base: tokens, fonts (Atkinson Next/Mono), radii, logo quote mark — inline
- T2 S3,S4 synthetic data: fixtures from showcase, instant create from example, demo AI for demo tasks, simulate class — inline
- T3 S1 codes PROFE-/ALUM-: account store, endpoints, client helper — inline
- T4 S1,S2,S5 teacher screens D1,D1m,D2,D3,D3b,D4,D5,D5b,D5o,D5p,D5v — delegated (parallel with T5, disjoint surfaces)
- T5 S1,S2,S5 student screens A1,A2,A3*,A4,A5,A5m,A6,A6m,V1 — delegated (parallel with T4)
- T6 seam check: tests, lint, build, browser run

## Log
- L1 2026-10-31 user: "Ahora usa todo qloq ue hemsao palntel para hacer al producicon, modificalo lo que haya de moduficar, para qeu tenga logica de fucnimiento, con lo que mostramso en el pencial, asi mismo, el flujo debe ser calro, , usara la data sintetica, tanto en la entrega como para la creacion de tarea, osea podemos simular todo, acorta los timepo de carga, o quitarlo porqeu no permiten la correcta epsoiicones,  y de mas, debe ser lo mas parcido al pnecil"
