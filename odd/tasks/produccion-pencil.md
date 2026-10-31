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
- [x] T1 S1,S5 visual base: tokens, fonts (Atkinson Next/Mono), radii, logo quote mark — inline — 8c2f44a
- [x] T2 S3,S4 synthetic data: fixtures from showcase, instant create from example, demo AI for demo tasks, simulate class — inline — 8c2f44a
- [x] T3 S1 codes PROFE-/ALUM-: account store, endpoints, client helper — inline — 8c2f44a, e179225
- [x] T4 S1,S2,S5 teacher screens D1,D1m,D2,D3,D3b,D4,D5,D5b,D5o,D5p,D5v — delegated (parallel with T5, disjoint surfaces) — 7c353e5
- [x] T5 S1,S2,S5 student screens A1,A2,A3*,A4,A5,A5m,A6,A6m,V1 — delegated (parallel with T4) — 83a6d97
- [x] T6 seam check: tests, lint, build, browser run

## Log
- L1 2026-10-31 user: "Ahora usa todo qloq ue hemsao palntel para hacer al producicon, modificalo lo que haya de moduficar, para qeu tenga logica de fucnimiento, con lo que mostramso en el pencial, asi mismo, el flujo debe ser calro, , usara la data sintetica, tanto en la entrega como para la creacion de tarea, osea podemos simular todo, acorta los timepo de carga, o quitarlo porqeu no permiten la correcta epsoiicones,  y de mas, debe ser lo mas parcido al pnecil"
- L2 T1-T3 done inline: 9 fixtures exported from the production showcase (synthetic students), vitest 103/103, tsc and eslint clean. Codes use 6 characters (PROFE-XXXXXX) instead of Pencil's 4 to make guessing harder. T4/T5 delegated in parallel (writer trigger: two independent units, disjoint surfaces, each several hundred lines).
- L3 Seam check: tsc and eslint clean, vitest 142/142, next build ok. API smoke test on a local server (memory store, no AI keys): create from example, simulate class, per-criterion grading, redo, hand-in, defense, accounts; every call under 200 ms. Browser: D1, D2, D3/D3b, D5 confirm, A1, A2, A3e2, A6 checked. Fixed doubled quote marks in D5 and a smaller home headline. Open: self-paced tasks (teacher never saved settings) still show the AI grade to the student at once; app-bar code chip does not refresh after a hand-in on the same device.
