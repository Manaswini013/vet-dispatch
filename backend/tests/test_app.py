from app.data.store import CASES, VETS, seed_demo_vets
from app.schemas.triage import TriageRequest
from app.services.dispatch_service import dispatch_waiting_cases, haversine_distance_km
from app.services.triage_service import triage_service


def test_seeded_vets_exist():
    seed_demo_vets()
    assert len(VETS) >= 2
    assert "vet-001" in VETS
    assert "vet-002" in VETS


def test_haversine_distance_is_positive():
    distance = haversine_distance_km(17.3850, 78.4867, 17.4200, 78.4500)
    assert distance > 0


def test_triage_service_rejects_empty_text():
    try:
        triage_service.analyze_text("   ")
        assert False, "Expected ValueError for empty text"
    except ValueError:
        pass


def test_triage_request_model_validates_text():
    model = TriageRequest(text="My goat is weak and not eating.")
    assert model.text == "My goat is weak and not eating."


def test_waiting_case_dispatch_prioritizes_critical():
    seed_demo_vets()
    CASES.clear()

    case = {
        "id": "case-1",
        "farmer_name": "Ramesh",
        "farmer_phone": "9999999999",
        "description": "Cow is unable to stand and breathing very hard.",
        "animal": {"species": "cattle"},
        "symptoms": ["unable to stand", "difficulty breathing"],
        "duration": "1 day",
        "red_flags": ["unable to stand", "breathing difficulty"],
        "urgency": "CRITICAL",
        "confidence": 0.9,
        "reason": "Emergency indicators observed.",
        "location": {"latitude": 17.3850, "longitude": 78.4867, "address": "Hyderabad"},
        "status": "WAITING",
        "assigned_vet_id": None,
        "estimated_arrival_minutes": None,
        "created_at": "2026-09-16T00:00:00",
        "assigned_at": None,
    }
    CASES[case["id"]] = case

    result = dispatch_waiting_cases()
    assert isinstance(result, list)
    assert any(item["assigned"] for item in result)
