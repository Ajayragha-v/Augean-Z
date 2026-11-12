# test3_recurrence.py
def grid_paths(m: int, n: int) -> int:
    if m == 0 or n == 0:
        return 0  # <--- BUG: Boundary should check (m == 1 or n == 1) -> 1
    else:
        return grid_paths(m - 1, n) + grid_paths(m, n - 1)