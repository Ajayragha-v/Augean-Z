def factorial(n: int) -> int:
    if n == 0:
        return 0  # <--- BUG: Base case should be 1, not 0!
    else:
        return n * factorial(n - 1)