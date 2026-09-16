from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class VetStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    ON_VISIT = "ON_VISIT"
    OFFLINE = "OFFLINE"


class Vet(BaseModel):
    id: str
    name: str
    phone: Optional[str] = None
    specializations: list[str] = Field(default_factory=list)
    latitude: float
    longitude: float
    status: VetStatus = VetStatus.AVAILABLE
    current_case_id: Optional[str] = None
    total_active_cases: int = 0
    completed_cases: int = 0

    model_config = ConfigDict(use_enum_values=True)


class VetCreateRequest(BaseModel):
    name: str
    phone: Optional[str] = None
    specializations: list[str] = Field(default_factory=list)
    latitude: float
    longitude: float
    status: VetStatus = VetStatus.AVAILABLE


class VetStatusUpdate(BaseModel):
    status: VetStatus
