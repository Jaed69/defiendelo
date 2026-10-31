# Búsqueda en una lista ordenada - ana_23
#
# Decisiones:
# 1. Consideré dos enfoques: la búsqueda lineal (recorrer toda la lista) y la
#    búsqueda binaria (partir la lista por la mitad en cada paso). Descarté la
#    lineal porque con 1000 números puede hacer 1000 comparaciones, y la binaria
#    solo unas 10, porque cada vuelta descarta la mitad de la lista.
# 2. Le pedí a ChatGPT una primera versión. Me dio el while con "low < high",
#    y con una lista de un solo elemento nunca entraba al bucle y devolvía -1
#    aunque el valor estaba. Lo verifiqué con buscar([7], 7) y lo cambié a
#    "low <= high".
# 3. Usé mid = (low + high) // 2 con división entera para que mid sea una
#    posición válida de la lista.


def buscar(lista, valor):
    low = 0
    high = len(lista) - 1
    while low <= high:
        mid = (low + high) // 2
        if lista[mid] == valor:
            return mid
        if lista[mid] < valor:
            low = mid + 1  # el valor está a la derecha: descarto la mitad izquierda
        else:
            high = mid - 1  # el valor está a la izquierda: descarto la mitad derecha
    return -1


# Casos de prueba que diseñé yo:
assert buscar([], 5) == -1  # lista vacía: no entra al bucle
assert buscar([7], 7) == 0  # un solo elemento: el caso que fallaba con "low < high"
assert buscar([1, 3, 5, 7, 9], 9) == 4  # el último elemento
assert buscar([1, 3, 5, 7, 9], 4) == -1  # un valor que no está, entre dos que sí
print("Todas las pruebas pasaron")
