# Busqueda binaria - bruno
# Uso busqueda binaria porque es mas rapida que la lineal.


def buscar(lista, valor):
    izq = 0
    der = len(lista) - 1
    while izq <= der:
        medio = (izq + der) // 2
        if lista[medio] == valor:
            return medio
        elif lista[medio] < valor:
            izq = medio + 1
        else:
            der = medio - 1
    return -1


# pruebas
print(buscar([2, 4, 6, 8], 6))  # 2
print(buscar([2, 4, 6, 8], 5))  # -1
print(buscar([], 1))  # -1
