from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.data.store import seed_demo_vets
from app.routes.cases import router as cases_router
from app.routes.triage import router as triage_router
from app.routes.vets import router as vets_router
from app.routes.voice import router as voice_router

app = FastAPI(
    title="Veterinary AI Dispatch",
    description="AI-powered emergency veterinary triage and dispatch system.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"success": False, "error": "Validation error."},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error."},
    )


@app.on_event("startup")
def startup_event():
    seed_demo_vets()


app.include_router(triage_router)
app.include_router(voice_router)
app.include_router(cases_router)
app.include_router(vets_router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "veterinary-ai-dispatch",
        "ai": {
            "speech_to_text": "Whisper",
            "llm": "Gemma 4 via llama.cpp",
        },
        "dispatch": "active",
    }
