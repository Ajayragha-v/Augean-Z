# Augean-Z: Neuro-Symbolic Category Theory & Formal Verification Code Repair

Augean-Z is a production-ready neuro-symbolic code debugger and automatic repair system that transforms buggy, non-deterministic Python code into verified, clean code using:
- **HOAS Category Graph Lifting**: Lifts imperative AST into category-theoretic objects, morphisms, and fixpoint representations.
- **Topological & Invariant Bug Detection**: Formally diagnoses base case collapses, boundary errors, dead branch invariants, and non-terminating loops.
- **Lean 4 Proof Kernel Verification**: Certifies mathematical correctness, invariants, and termination.
- **Generative Code Synthesis**: Synthesizes verified, clean, idiomatic Python code.
- **Automated Pytest Execution**: Runs real runtime assertions against repaired functions.

---

## Architecture Overview

```
+-----------------------------------------------------------+
|                      USER CODE INPUT                      |
+-----------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------+
|                1. AST & HOAS CATEGORY GRAPH               |
+-----------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------+
|               2. INVARIANT & DIAGNOSTIC AUDIT             |
+-----------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------+
|             3. LEAN 4 FORMAL PROOF KERNEL AUDIT           |
+-----------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------+
|          4. NEURO-SYMBOLIC CODE SYNTHESIS ENGINE          |
+-----------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------+
|             5. DYNAMIC PYTEST RUNTIME TEST SUITE          |
+-----------------------------------------------------------+
```

---

## Quickstart

### 1. Backend Server (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd augean-z-backend
   ```
2. Start the API server:
   ```bash
   python server.py
   ```
   The backend runs on `http://127.0.0.1:8000` with the `/api/analyze` endpoint.

### 2. Frontend Application (React + Vite + Tailwind CSS)

1. Navigate to the frontend directory:
   ```bash
   cd augean-z-frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/debugger` in your browser.

---

## Dynamic Input & Output

You can type **any code** into the editor or upload any `.py` file:
- **Factorial base case errors**: `if n == 0: return 0` &rarr; automatically repaired to `return 1`.
- **Branch logic bugs**: `if a > b: return a; else: return a` &rarr; automatically repaired to return `b`.
- **Recurrence boundary errors**: `grid_paths` boundary conditions &rarr; dynamically corrected to `(m == 1 or n == 1) -> 1`.
- **Infinite recursion / Non-terminating loops**: `collatz_sum` passing invariant `idx` &rarr; structurally transformed to `idx + 1`.
- **Arbitrary Custom Functions**: Analyzed dynamically through AST invariant checkers and synthesis rules.