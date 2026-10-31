"""
Implementation of the binary search algorithm.

This module provides an efficient O(log n) search function for sorted lists.
"""
from typing import List


def buscar(lista: List[int], valor: int) -> int:
    """
    Performs a binary search on a sorted list.

    Args:
        lista: A list of integers sorted in ascending order.
        valor: The target value to search for.

    Returns:
        The index of the target value if found, otherwise -1.
    """
    left, right = 0, len(lista) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if lista[mid] == valor:
            return mid
        elif lista[mid] < valor:
            left = mid + 1
        else:
            right = mid - 1
    return -1


if __name__ == "__main__":
    test_cases = [([1, 2, 3, 4, 5], 3, 2), ([], 1, -1), ([10, 20, 30], 25, -1)]
    for arr, target, expected in test_cases:
        assert buscar(arr, target) == expected
    print("All tests passed!")
