# test4_complex.py
def collatz_sum(lst: list, idx: int = 0, total: int = 0) -> int:
    if idx >= len(lst):
        return total
    else:
        val = lst[idx]
        # BUG: Recursive call passes 'idx' without incrementing '(idx + 1)'
        return collatz_sum(lst, idx, total + val)