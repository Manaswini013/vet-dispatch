import os
import tempfile

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.data.store import CASES
from app.services.dispatch_service import assign_vet_to_case
from app.services.triage_service import triage_service
from app.services.whisper_service import whisper_service

router = APIRouter(prefix="/api", tags=["Voice"])


def _save_upload(file: UploadFile) -> str:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Audio file is required.")

    suffix = os.path.splitext(file.filename)[1] or ".webm"
    temp_path = None
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
        temp_path = temp.name
        temp.write(file.file.read())
    return temp_path


@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    temp_path = None
    try:
        temp_path = _save_upload(file)
        result = whisper_service.transcribe(temp_path)
        return {"success": True, "transcription": result}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass


@router.post("/voice-triage")
async def voice_triage(file: UploadFile = File(...)):
    temp_path = None
    try:
        temp_path = _save_upload(file)
        transcription = whisper_service.transcribe(temp_path)
        transcript = transcription["text"]
        if not transcript.strip():
            raise HTTPException(status_code=400, detail="Could not understand the audio.")
        triage = triage_service.analyze_text(transcript)
        return {"success": True, "transcription": transcription, "triage": triage}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass


@router.post("/voice-case")
async def voice_case(
    file: UploadFile = File(...),
    farmer_name: str | None = Form(default=None),
    farmer_phone: str | None = Form(default=None),
    latitude: float | None = Form(default=None),
    longitude: float | None = Form(default=None),
    address: str | None = Form(default=None),
):
    temp_path = None
    try:
        if latitude is None or longitude is None:
            raise HTTPException(status_code=400, detail="latitude and longitude are required.")
        temp_path = _save_upload(file)
        transcription = whisper_service.transcribe(temp_path)
        transcript = transcription["text"]
        if not transcript.strip():
            raise HTTPException(status_code=400, detail="Could not understand the audio.")
        triage = triage_service.analyze_text(transcript)

        import uuid
        case_id = f"case-{uuid.uuid4().hex[:8]}"
        case = {
            "id": case_id,
            "farmer_name": farmer_name,
            "farmer_phone": farmer_phone,
            "description": transcript,
            "animal": {"species": (triage.get("animal", {}) or {}).get("species")},
            "symptoms": triage.get("symptoms", []),
            "duration": triage.get("duration"),
            "red_flags": triage.get("red_flags", []),
            "urgency": triage.get("urgency", "UNKNOWN"),
            "confidence": float(triage.get("confidence", 0.0)),
            "reason": triage.get("reason", ""),
            "location": {"latitude": latitude, "longitude": longitude, "address": address},
            "status": "WAITING",
            "assigned_vet_id": None,
            "estimated_arrival_minutes": None,
            "created_at": __import__("datetime").datetime.utcnow().isoformat(),
            "assigned_at": None,
        }
        CASES[case_id] = case
        dispatch = assign_vet_to_case(case)
        return {"success": True, "transcription": transcription, "case": case, "dispatch": dispatch}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass
