from __future__ import annotations

from typing import Dict

VETS: Dict[str, dict] = {}
CASES: Dict[str, dict] = {}


def seed_demo_vets() -> Dict[str, dict]:
    """Ensure the in-memory store starts with a couple of demo vets."""
    if "vet-001" not in VETS:
        VETS["vet-001"] = {
            "id": "vet-001",
            "name": "Dr. Ananya Rao",
            "phone": "9999999999",
            "specializations": ["large_animals", "general"],
            "latitude": 17.3850,
            "longitude": 78.4867,
            "status": "AVAILABLE",
            "current_case_id": None,
            "total_active_cases": 0,
            "completed_cases": 0,
        }

    if "vet-002" not in VETS:
        VETS["vet-002"] = {
            "id": "vet-002",
            "name": "Dr. Ravi Kumar",
            "phone": "8888888888",
            "specializations": ["general", "small_animals"],
            "latitude": 17.4200,
            "longitude": 78.4500,
            "status": "AVAILABLE",
            "current_case_id": None,
            "total_active_cases": 0,
            "completed_cases": 0,
        }

    return VETS
