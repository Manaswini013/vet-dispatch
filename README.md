# Emergency Veterinary AI Dispatch

A local-first emergency veterinary dispatch prototype. Farmers can describe an animal emergency by text or voice, receive AI-assisted triage, and request the nearest suitable available veterinarian. The vet dashboard shows active cases and dispatch status.

## Source Repository

Public source repository: **[replace this link with the published repository URL](https://github.com/Manaswini013/vet-dispatch)**

This workspace is not connected to a Git remote yet, so the URL above must be updated after publishing the project.

## Stack

- React + Vite frontend
- FastAPI backend
- Faster-Whisper speech-to-text
- Local llama.cpp OpenAI-compatible server running Gemma 4
- In-memory cases and veterinarian records
- Deterministic distance, urgency, workload, and specialization dispatch scoring

## Requirements

- Windows PowerShell
- Python 3.12+
- `uv` installed and available on `PATH`
- Node.js 18+ and npm
- Local llama.cpp `llama-server.exe`
- A compatible GGUF model, such as Gemma 4 E4B
- A working microphone for voice mode

## Setup

From the repository root, run the bootstrap script:

```powershell
.\setup.ps1
```

The script installs/synchronizes Python dependencies with `uv`, installs frontend npm dependencies, and checks the expected local AI files. It does not download the multi-gigabyte LLM or Whisper model automatically.

If PowerShell blocks local scripts for this session, run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\setup.ps1
```

## Run The System

Open three PowerShell terminals.

### 1. Start the local LLM server

The default project launcher expects:

```powershell
.\backend\llm.ps1
```

It starts llama.cpp on `http://127.0.0.1:8080`. Edit `backend\llm.ps1` if your llama.cpp executable or GGUF model is stored elsewhere.

### 2. Start the backend

```powershell
Set-Location .\backend
uv run uvicorn app.main:app --reload
```

Backend: `http://127.0.0.1:8000`

Health check: `http://127.0.0.1:8000/health`

The first backend start may download/load the Faster-Whisper `small` model through `faster-whisper`. Keep the terminal open while it loads.

### 3. Start the frontend

```powershell
Set-Location .\frontend
npm run dev -- --host 127.0.0.1
```

Frontend: `http://127.0.0.1:5173`

Use `/report` for farmer reporting and `/vet` for the dispatch dashboard.

## How To Proceed With The Task

1. Run `setup.ps1` once.
2. Start llama.cpp, the FastAPI backend, and the Vite frontend in separate terminals.
3. Open `/report`, allow microphone access, and test both text and voice triage.
4. Submit a case and open `/vet` to verify it appears in the active queue.
5. Assign, complete, or cancel the case from the dashboard.
6. Before sharing the project, replace the placeholder source-repository URL and run `npm run build` plus the backend tests.

## Product Trade-offs, Triage Assumptions, And Edge Cases

This prototype prioritizes a fast, explainable emergency workflow over production-scale infrastructure. Cases and veterinarian records are stored in memory, so restarts intentionally clear state; this keeps the demo simple and avoids adding a database, authentication, queues, or external map services. Dispatch uses the Haversine distance between supplied coordinates, a fixed 30 km/h ETA assumption, current workload, urgency, and specialization. It is deterministic and easy to inspect, but it is not a live traffic or travel-time estimate.

Triage is decision support, not diagnosis. The model extracts species, symptoms, duration, red flags, urgency, confidence, and a reason from the farmer's description. Severe indicators are allowed to raise urgency through a local override, while vague or empty descriptions remain `UNKNOWN` instead of being presented as safe. The UI keeps the raw transcript visible so a user can correct it before requesting dispatch. Voice input depends on browser microphone permission and a supported MediaRecorder format; the client preserves the browser's WebM or Ogg type when uploading. Empty recordings, denied permissions, unavailable microphones, blank transcripts, model errors, unavailable vets, and invalid locations receive explicit error or waiting states.

The system favors available local veterinarians and automatically frees a vet after completion or cancellation. Location defaults are demo coordinates only and must be replaced with real user-provided coordinates in a production workflow. The current design intentionally avoids medical treatment instructions, guaranteed arrival promises, external map APIs, persistent personal data, and unattended autonomous clinical decisions.

## API Overview

- `POST /api/triage`
- `POST /api/transcribe`
- `POST /api/voice-triage`
- `POST /api/voice-case`
- `GET /api/cases`
- `POST /api/cases`
- `POST /api/cases/{case_id}/assign`
- `POST /api/cases/{case_id}/complete`
- `POST /api/cases/{case_id}/cancel`
- `GET /api/vets`
- `POST /api/vets`
- `PATCH /api/vets/{vet_id}/status`
- `GET /health`

## Validation

```powershell
Set-Location .\frontend
npm run build
npm run lint

Set-Location ..\backend
uv run pytest
```

`npm run lint` may report existing dashboard hook-rule findings; the production build is the primary frontend compilation check.
