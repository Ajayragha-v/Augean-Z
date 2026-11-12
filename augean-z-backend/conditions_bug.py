# test2_conditions.py
def max_three(a: int, b: int) -> int:
    if a > b:
        return a
    else:
        return a  # <--- BUG: Logical branch returns 'a' instead of 'b