"""
Augean-Z Production API Server
Provides REST and health check endpoints for code analysis,
structural HOAS category graph transformation, formal Lean verification,
and clean code synthesis.
"""

import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from engine import run_augean_pipeline, load_dotenv

load_dotenv()

app = FastAPI(
    title="Augean-Z Production API Server",
    description="Neuro-Symbolic Category Theory & Formal Verification API",
    version="2.0.0"
)

# Enable CORS for frontend Vite development & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    code: str
    target_func: Optional[str] = None
    simulate_failure: Optional[bool] = False
    fail_stage: Optional[str] = None
    max_retries: Optional[int] = 5

@app.get("/")
@app.get("/api/health")
def health_check():
    provider = os.getenv("PROVIDER", "openai")
    model = os.getenv("MODEL_NAME", os.getenv("MODEL", "gpt-4o-mini"))
    has_key = bool(os.getenv("API_KEY") and not os.getenv("API_KEY").startswith("your_"))
    return {
        "service": "Augean-Z Production Engine",
        "status": "online",
        "version": "2.0.0",
        "provider": provider,
        "model": model,
        "has_api_key": has_key,
        "pipeline_stages": [
            "USER_INPUT",
            "HOTT_CFG",
            "JULIA_COMPILER",
            "TARGET_TOPOS",
            "MULTIPLE_SOLUTIONS",
            "LEAN",
            "LLM",
            "INVERSE_PARSER",
            "FIXED_CODE_REGENERATOR",
            "GREEN_FLAG_TEST"
        ]
    }

@app.post("/api/analyze")
def analyze_code(req: AnalyzeRequest):
    if not req.code or not req.code.strip():
        raise HTTPException(status_code=400, detail="Empty code submitted for analysis.")

    try:
        pipeline_result = run_augean_pipeline(req.code, max_retries=req.max_retries or 5)

        if req.simulate_failure:
            pipeline_result["verified"] = False
            pipeline_result["leanLog"] = "SIMULATED_LEAN_FAILURE: Kernel invariant check artificially tripped by debugger toggle."
            pipeline_result["metrics"]["status"] = "FAILED"

        return pipeline_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution error: {str(e)}")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="127.0.0.1", port=port)
