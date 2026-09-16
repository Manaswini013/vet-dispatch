# Veterinary AI Dispatch Prototype

## Overview
This project is a working prototype for an emergency veterinary AI dispatch system. It accepts a farmer's natural-language description of an animal problem, optionally through audio, runs local AI triage, and assigns the best available veterinarian from an in-memory dispatch pool.

## Architecture
- FastAPI backend
- Pydantic validation
- Local Whisper for speech-to-text
- Local llama.cpp server for LLM triage
- In-memory case and vet storage
- Deterministic dispatch engine for vet assignment

## Requirements
- Python 3.12+
- uv
- Local llama.cpp server with an OpenAI-compatible endpoint at http://127.0.0.1:8080/v1/chat/completions
- Whisper small model installed locally

## Install
```bash
uv sync
```

## Start llama.cpp
```bash
llama-server -m /path/to/your-model.gguf --host 127.0.0.1 --port 8080
```

## Start backend
```bash
uv run uvicorn app.main:app --reload
```

## API endpoints
- POST /api/triage
- POST /api/transcribe
- POST /api/voice-triage
- POST /api/voice-case
- GET /api/cases
- GET /api/cases/{case_id}
- POST /api/cases
- POST /api/cases/{case_id}/assign
- POST /api/cases/{case_id}/complete
- POST /api/cases/{case_id}/cancel
- GET /api/cases/queue
- GET /api/vets
- POST /api/vets
- GET /api/vets/{vet_id}
- PATCH /api/vets/{vet_id}/status
- GET /health

## Example requests

### Text triage
```bash
curl -X POST http://127.0.0.1:8000/api/triage \
  -H "Content-Type: application/json" \
  -d '{"text":"My goat has stopped eating and is having difficulty breathing."}'
```

### Create case
```bash
curl -X POST http://127.0.0.1:8000/api/cases \
  -H "Content-Type: application/json" \
  -d '{
    "farmer_name":"Ramesh",
    "farmer_phone":"9999999999",
    "description":"My cow has not eaten since yesterday and cannot stand.",
    "latitude":17.385,
    "longitude":78.4867,
    "address":"Hyderabad"
  }'
```

### Add vet
```bash
curl -X POST http://127.0.0.1:8000/api/vets \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Dr. Meera Sharma",
    "phone":"9999999999",
    "specializations":["large_animals"],
    "latitude":17.3900,
    "longitude":78.4800
  }'
```

## Dispatch algorithm
The dispatch engine filters to vets whose status is AVAILABLE, computes the distance using the Haversine formula, estimates ETA from an assumed 30 km/h travel speed, and scores each candidate using urgency, ETA, active workload, and specialization compatibility. Lower scores are prioritized, but the algorithm remains deterministic and simple for prototype use.

## Storage
This prototype stores cases and vet records in memory only. The current implementation is intentionally simple and will later be replaced with Firebase or another persistent database backend.
