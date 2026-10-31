# Flujo sintético de Defiéndelo (sin claves de IA)

Archivos para recorrer el flujo completo, de docente a alumno, en modo demo. Si no hay `ANTHROPIC_API_KEY` ni `OPENROUTER_API_KEY`, la app usa respuestas de IA simuladas.

```
docente/tarea-original.pdf        lo que sube el profe (tarea de siempre, con su rúbrica de hoy)
alumnos/ana_23-busqueda.py        entiende lo que entregó
alumnos/bruno-busqueda.py         lo hizo, pero explica poco
alumnos/luz-busqueda.py           copió la respuesta de la IA
alumnos/respuestas-defensa.md     qué responde cada uno y qué nota le pone el docente
```

## Pasos

### Docente: preparar la tarea
1. En la portada, en «Rediseña una tarea», escribe el título «Búsqueda en una lista ordenada» y la materia «Programación, 4.° de secundaria».
2. Arrastra `docente/tarea-original.pdf` a «Tarea original» y pulsa **Rediseñar la tarea**.
3. En «1. Tu tarea»:
   - **Editar**: cambia algo de la rúbrica (los pesos deben sumar 100%) y guarda.
   - **Probar con la IA sola** (opcional): compara la nota que saca la IA sola en la tarea de siempre y en la rediseñada.
   - **Cómo vas a evaluar**: elige *AD · A · B · C* (o *Numérica* 20 / 11), la defensa (*Oral* o *Escrito en el celular*), un plazo opcional y **Guardar**.
   - **Copiar enlace** para los alumnos.

### Alumnos: entregar (abre el enlace en tres ventanas privadas, una por alumno)
4. Cada alumno escribe su apodo (`ana_23`, `bruno`, `luz`), sube su `.py` y pulsa **Entregar**.

### Docente: evaluar en «2. Entregas»
5. **Cerrar entregas y empezar las defensas**.
6. Según el método:
   - **Oral**: «Llamar» al primero. El alumno ve «¡Te toca!» con la pregunta, y el docente la ve también. Pon la letra o la nota con la tabla de `respuestas-defensa.md`: al guardarla, el turno pasa al siguiente.
   - **Escrito en el celular**: cada alumno escribe a mano sus respuestas de `respuestas-defensa.md`. La app sugiere una letra según lo que explicó y el docente la confirma.
7. **Publicar las notas**. El reporte muestra cuántos lograron A o AD (o cuántos aprobaron y el promedio), y cada alumno ve su nota.
