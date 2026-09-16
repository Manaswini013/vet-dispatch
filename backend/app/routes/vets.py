from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException

from app.data.store import VETS
from app.schemas.vet import VetCreateRequest, VetStatusUpdate
from app.services.dispatch_service import dispatch_waiting_cases

router = APIRouter(prefix="/api", tags=["Vets"])


@router.get("/vets")
def list_vets():
    return {"success": True, "vets": list(VETS.values())}


@router.post("/vets")
def create_vet(payload: VetCreateRequest):
    vet_id = f"vet-{uuid.uuid4().hex[:8]}"
    vet = {
        "id": vet_id,
        "name": payload.name,
        "phone": payload.phone,
        "specializations": payload.specializations,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "status": payload.status.value if hasattr(payload.status, "value") else str(payload.status),
        "current_case_id": None,
        "total_active_cases": 0,
        "completed_cases": 0,
    }
    VETS[vet_id] = vet
    return {"success": True, "vet": vet}


@router.get("/vets/{vet_id}")
def get_vet(vet_id: str):
    vet = VETS.get(vet_id)
    if not vet:
        raise HTTPException(status_code=404, detail="Vet not found.")
    return {"success": True, "vet": vet}


@router.patch("/vets/{vet_id}/status")
def update_vet_status(vet_id: str, payload: VetStatusUpdate):
    vet = VETS.get(vet_id)
    if not vet:
        raise HTTPException(status_code=404, detail="Vet not found.")
    vet["status"] = payload.status.value if hasattr(payload.status, "value") else str(payload.status)
    if vet["status"] == "AVAILABLE":
        dispatch_waiting_cases()
    return {"success": True, "vet": vet}
