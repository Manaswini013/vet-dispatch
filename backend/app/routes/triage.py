from fastapi import APIRouter, HTTPException

from app.schemas.triage import TriageRequest
from app.services.triage_service import triage_service


router = APIRouter(
    prefix="/api",
    tags=["Triage"]
)


@router.post("/triage")
def triage(request: TriageRequest):

    try:

        result = triage_service.analyze_text(
            request.text
        )

        return {
            "success": True,
            "triage": result
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )