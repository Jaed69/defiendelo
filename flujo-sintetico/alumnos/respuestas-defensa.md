# Respuestas de la defensa (para escribirlas a mano)

En la defensa escrita no se puede pegar texto, así que hay que escribirlas. Sin clave de IA, la app hace siempre estas preguntas, en este orden (en sesión en vivo solo cuentan las primeras N que configure el docente; por defecto 2):

1. «En tu entrega empiezas con "…". ¿Por qué elegiste ese punto de partida y no otro?»
2. «¿Qué parte de lo que te dio la IA revisaste o corregiste, y cómo supiste que estaba mal?»
3. «¿Qué alternativa descartaste? ¿En qué caso concreto habría sido mejor esa alternativa?»
4. «Si el tamaño de la entrada se multiplica por 100, ¿qué parte de tu solución falla primero y por qué?»

Sin IA, la app puntúa cada respuesta por su largo y por cuántas palabras de la propia entrega menciona. Por eso estas respuestas dan resultados distintos.

## ana_23: entiende lo que entregó (esperado: AD)

1. Empecé con los comentarios de mis decisiones porque la búsqueda binaria solo funciona si la lista está ordenada, y quería dejar claro por qué descarté la búsqueda lineal antes de escribir la función buscar.
2. La versión de ChatGPT usaba while low < high. Lo probé con buscar([7], 7) y devolvía -1 aunque el siete estaba, porque con un solo elemento nunca entraba al bucle. Lo cambié a low <= high y agregué ese caso de prueba.
3. Descarté la búsqueda lineal. Sería mejor si la lista no estuviera ordenada, o si fuera muy corta, como tres elementos, porque ordenar primero costaría más que recorrerla.
4. Nada falla: con cien veces más elementos la búsqueda binaria solo hace unas siete comparaciones más, porque cada vuelta del while descarta la mitad de la lista.

## bruno: lo hizo, pero explica poco (esperado: B)

1. Porque así empieza la búsqueda binaria.
2. Revisé con los prints que la función devuelva el número correcto y -1 cuando no está.
3. La lineal, porque es más lenta.
4. No sé, creo que nada.

## luz: copió la respuesta de la IA (esperado: C)

1. no sé, lo hizo chatgpt
2. nada
3. no sé
4. no sé

## Notas que pondría el docente

| Alumno | Literal (secundaria) | Numérica sobre 20, mínimo 11 (universidad) |
| --- | --- | --- |
| ana_23 | AD | 18 |
| bruno | B | 12 |
| luz | C | 7 |

Reporte esperado: «1 de 3 lograron A o AD» con la escala literal, o «2 de 3 aprobaron» y un promedio de 12.3 con la numérica.
