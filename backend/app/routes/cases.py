from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException, Query

from app.data.store import CASES, VETS
from app.services.dispatch_service import assign_vet_to_case, dispatch_waiting_cases
from app.services.triage_service import triage_service
from app.schemas.case import CaseCreateRequest, CaseRecord
from app.schemas.triage import AnimalInfo

router = APIRouter(prefix="/api", tags=["Cases"])


def _case_or_404(case_id: str) -> dict:
    case = CASES.get(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    return case


def _ensure_waiting(case: dict) -> None:
    case["status"] = "WAITING"
    case["assigned_vet_id"] = None
    case["estimated_arrival_minutes"] = None
    case["assigned_at"] = None


@router.post("/cases")
def create_case(payload: CaseCreateRequest):
    try:
        triage = triage_service.analyze_text(payload.description)
        case_id = f"case-{uuid.uuid4().hex[:8]}"
        case = {
            "id": case_id,
            "farmer_name": payload.farmer_name,
            "farmer_phone": payload.farmer_phone,
            "description": payload.description,
            "animal": {"species": (triage.get("animal", {}) or {}).get("species")},
            "symptoms": triage.get("symptoms", []),
            "duration": triage.get("duration"),
            "red_flags": triage.get("red_flags", []),
            "urgency": triage.get("urgency", "UNKNOWN"),
            "confidence": float(triage.get("confidence", 0.0)),
            "reason": triage.get("reason", ""),
            "location": {
                "latitude": payload.latitude,
                "longitude": payload.longitude,
                "address": payload.address,
            },
            "status": "WAITING",
            "assigned_vet_id": None,
            "estimated_arrival_minutes": None,
            "created_at": datetime.utcnow().isoformat(),
            "assigned_at": None,
        }
        CASES[case_id] = case
        dispatch = assign_vet_to_case(case)
        case_record = CaseRecord.model_validate(case)
        return {"success": True, "case": case_record.model_dump(mode="json"), "dispatch": dispatch}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="AI processing failed.") from exc


@router.get("/cases")
def list_cases(status: str | None = Query(default=None)):
    items = list(CASES.values())
    if status:
        items = [case for case in items if str(case.get("status", "")).upper() == status.upper()]
    ordered = sorted(items, key=lambda case: case.get("created_at") or "")
    return {"success": True, "cases": ordered}


@router.get("/cases/{case_id}")
def get_case(case_id: str):
    case = _case_or_404(case_id)
    return {"success": True, "case": case}


@router.post("/cases/{case_id}/assign")
def assign_case(case_id: str):
    case = _case_or_404(case_id)
    dispatch = assign_vet_to_case(case)
    if not dispatch.get("assigned"):
        return {"success": True, "case": case, "dispatch": dispatch}
    return {"success": True, "case": case, "dispatch": dispatch}


@router.post("/cases/{case_id}/complete")
def complete_case(case_id: str):
    case = _case_or_404(case_id)
    case["status"] = "COMPLETED"
    vet_id = case.get("assigned_vet_id")
    if vet_id and vet_id in VETS:
        vet = VETS[vet_id]
        vet["status"] = "AVAILABLE"
        vet["current_case_id"] = None
        vet["total_active_cases"] = max(0, int(vet.get("total_active_cases", 0)) - 1)
        vet["completed_cases"] = int(vet.get("completed_cases", 0)) + 1
    case["assigned_vet_id"] = None
    case["estimated_arrival_minutes"] = None
    case["assigned_at"] = None
    dispatch = dispatch_waiting_cases()
    return {"success": True, "case": case, "dispatch": dispatch}


@router.post("/cases/{case_id}/cancel")
def cancel_case(case_id: str):
    case = _case_or_404(case_id)
    vet_id = case.get("assigned_vet_id")
    if vet_id and vet_id in VETS:
        vet = VETS[vet_id]
        vet["status"] = "AVAILABLE"
        vet["current_case_id"] = None
        vet["total_active_cases"] = max(0, int(vet.get("total_active_cases", 0)) - 1)
    case["status"] = "CANCELLED"
    case["assigned_vet_id"] = None
    case["estimated_arrival_minutes"] = None
    case["assigned_at"] = None
    dispatch_waiting_cases()
    return {"success": True, "case": case}


@router.get("/cases/queue")
def case_queue():
    groups = {"critical": [], "urgent": [], "non_urgent": [], "unknown": []}
    for case in CASES.values():
        urgency = str(case.get("urgency", "UNKNOWN")).upper()
        key = {
            "CRITICAL": "critical",
            "URGENT": "urgent",
            "NON_URGENT": "non_urgent",
            "UNKNOWN": "unknown",
        }.get(urgency, "unknown")
        groups[key].append(case)

    for key in groups:
        groups[key].sort(key=lambda case: case.get("created_at") or "")

    return {"success": True, "queue": groups}
