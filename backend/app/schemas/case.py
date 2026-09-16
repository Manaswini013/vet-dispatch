from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.triage import AnimalInfo


class CaseStatus(str, Enum):
    WAITING = "WAITING"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class CaseLocation(BaseModel):
    latitude: float
    longitude: float
    address: Optional[str] = None


class CaseRecord(BaseModel):
    id: str
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    description: str
    animal: AnimalInfo
    symptoms: list[str] = Field(default_factory=list)
    duration: Optional[str] = None
    red_flags: list[str] = Field(default_factory=list)
    urgency: str
    confidence: float
    reason: str
    location: CaseLocation
    status: CaseStatus = CaseStatus.WAITING
    assigned_vet_id: Optional[str] = None
    estimated_arrival_minutes: Optional[int] = None
    created_at: datetime
    assigned_at: Optional[datetime] = None

    model_config = ConfigDict(use_enum_values=True)


class CaseCreateRequest(BaseModel):
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    description: str
    latitude: float
    longitude: float
    address: Optional[str] = None
