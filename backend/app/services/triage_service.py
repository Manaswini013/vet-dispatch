from app.schemas.triage import TriageResult
from app.services.llm_service import llm_service


class TriageService:
    def _apply_emergency_override(self, text: str, triage: dict) -> dict:
        lower_text = text.lower()
        severe_markers = {
            "unable to breathe": 2,
            "severe breathing difficulty": 2,
            "breathing difficulty": 1,
            "unconscious": 2,
            "seizure": 2,
            "severe bleeding": 2,
            "bleeding heavily": 2,
            "unable to stand": 2,
            "difficult birth": 2,
            "dystocia": 2,
            "major trauma": 2,
        }

        score = 0
        for phrase, weight in severe_markers.items():
            if phrase in lower_text:
                score += weight

        urgency = str(triage.get("urgency", "UNKNOWN")).upper()
        if score >= 2:
            triage["urgency"] = "CRITICAL" if score >= 4 else "URGENT"
        elif "severe breathing difficulty" in lower_text or "unable to breathe" in lower_text:
            triage["urgency"] = "URGENT"

        if triage.get("urgency") not in {"CRITICAL", "URGENT", "NON_URGENT", "UNKNOWN"}:
            triage["urgency"] = "UNKNOWN"

        return triage

    def analyze_text(self, text: str) -> dict:
        if not text or not text.strip():
            raise ValueError("Animal problem description cannot be empty.")

        raw_result = llm_service.triage(text)
        triage = self._apply_emergency_override(text, raw_result)
        validated = TriageResult.model_validate(triage)

        return validated.model_dump()


triage_service = TriageService()