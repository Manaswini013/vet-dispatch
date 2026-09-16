from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AnimalInfo(BaseModel):
    species: Optional[str] = None


class TriageResult(BaseModel):
    animal: AnimalInfo
    symptoms: list[str] = Field(default_factory=list)
    duration: Optional[str] = None
    red_flags: list[str] = Field(default_factory=list)
    urgency: str = "UNKNOWN"
    confidence: float = 0.0
    missing_information: list[str] = Field(default_factory=list)
    follow_up_question: Optional[str] = None
    reason: str = ""

    model_config = ConfigDict(str_strip_whitespace=True)

    @field_validator("urgency")
    @classmethod
    def validate_urgency(cls, value: str) -> str:
        allowed = {"CRITICAL", "URGENT", "NON_URGENT", "UNKNOWN"}
        normalized = str(value).upper()
        if normalized not in allowed:
            raise ValueError("Urgency must be one of: CRITICAL, URGENT, NON_URGENT, UNKNOWN")
        return normalized


class TriageRequest(BaseModel):
    text: str

    model_config = ConfigDict(str_strip_whitespace=True)
