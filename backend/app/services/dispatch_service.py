from __future__ import annotations

import math
from datetime import datetime
from typing import Any, Dict, List

from app.data.store import CASES, VETS


URGENT_PRIORITY = {"CRITICAL": 0, "URGENT": 1, "NON_URGENT": 2, "UNKNOWN": 3}


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_km = 6371.0
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius_km * c


def _species_category(species: str | None) -> str:
    if not species:
        return "general"
    normalized = (species or "").strip().lower()
    large_animals = {"cattle", "buffalo", "horse", "sheep", "goat"}
    small_animals = {"dog", "cat", "bird"}
    if normalized in large_animals:
        return "large_animals"
    if normalized in small_animals:
        return "small_animals"
    return "general"


def _specialization_penalty(vet: dict, species: str | None) -> int:
    specializations = {item.lower() for item in vet.get("specializations", [])}
    if "general" in specializations:
        return 50

    species_category = _species_category(species)
    if species_category in specializations:
        return 0

    return 150


def _calculate_eta(distance_km: float) -> int:
    eta = math.ceil((distance_km / 30.0) * 60)
    return max(1, int(eta))


def recommend_vet_for_case(case: dict) -> Dict[str, Any] | None:
    case_location = case.get("location", {})
    species = case.get("animal", {}).get("species")
    urgency = str(case.get("urgency", "UNKNOWN")).upper()

    candidates = []
    for vet in VETS.values():
        if vet.get("status") != "AVAILABLE":
            continue

        distance_km = haversine_distance_km(
            float(case_location.get("latitude", 0.0)),
            float(case_location.get("longitude", 0.0)),
            float(vet.get("latitude", 0.0)),
            float(vet.get("longitude", 0.0)),
        )

        eta = _calculate_eta(distance_km)
        eta_penalty = eta * 5
        workload_penalty = int(vet.get("total_active_cases", 0)) * 30
        specialization_penalty = _specialization_penalty(vet, species)

        urgency_weight = {"CRITICAL": 1000, "URGENT": 500, "NON_URGENT": 100, "UNKNOWN": 50}.get(urgency, 50)
        score = urgency_weight + eta_penalty + workload_penalty + specialization_penalty

        candidates.append({
            "vet": vet,
            "distance_km": distance_km,
            "estimated_minutes": eta,
            "score": score,
        })

    if not candidates:
        return None

    best = min(candidates, key=lambda item: (
        item["score"],
        item["estimated_minutes"],
        item["distance_km"],
        item["vet"]["id"],
    ))

    vet = best["vet"]
    return {
        "vet_id": vet["id"],
        "vet_name": vet["name"],
        "estimated_arrival_minutes": best["estimated_minutes"],
        "distance_km": round(best["distance_km"], 2),
        "score": best["score"],
        "reason": "Available, compatible with the animal, and has the lowest estimated response time.",
    }


def assign_vet_to_case(case: dict) -> Dict[str, Any]:
    recommendation = recommend_vet_for_case(case)
    if not recommendation:
        return {"assigned": False, "message": "No veterinarian is currently available.", "case_status": "WAITING"}

    vet_id = recommendation["vet_id"]
    vet = VETS.get(vet_id)
    if not vet:
        return {"assigned": False, "message": "No veterinarian is currently available.", "case_status": "WAITING"}

    case["assigned_vet_id"] = vet_id
    case["estimated_arrival_minutes"] = recommendation["estimated_arrival_minutes"]
    case["status"] = "ASSIGNED"
    case["assigned_at"] = datetime.utcnow().isoformat()

    vet["status"] = "ON_VISIT"
    vet["current_case_id"] = case["id"]
    vet["total_active_cases"] = int(vet.get("total_active_cases", 0)) + 1

    return {
        "assigned": True,
        "vet_id": vet_id,
        "vet_name": vet["name"],
        "estimated_arrival_minutes": recommendation["estimated_arrival_minutes"],
        "distance_km": recommendation["distance_km"],
        "score": recommendation["score"],
        "reason": recommendation["reason"],
        "case_status": "ASSIGNED",
    }


def dispatch_waiting_cases() -> List[dict]:
    waiting_cases = [
        case for case in CASES.values() if case.get("status") == "WAITING"
    ]
    waiting_cases.sort(
        key=lambda case: (
            URGENT_PRIORITY.get(str(case.get("urgency", "UNKNOWN")).upper(), 3),
            case.get("created_at") or "",
        )
    )

    results = []
    for case in waiting_cases:
        assigned = assign_vet_to_case(case)
        if assigned["assigned"]:
            results.append({"case_id": case["id"], "assigned": True, **assigned})
        else:
            results.append({"case_id": case["id"], "assigned": False, "message": assigned["message"], "case_status": "WAITING"})
    return results
