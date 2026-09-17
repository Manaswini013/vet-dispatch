import json
import os
import re
from typing import Any

from dotenv import load_dotenv
import requests

load_dotenv()

SYSTEM_PROMPT = """
You are a veterinary emergency triage assistant.

You help animal owners describe health problems to a veterinarian.

The animal can be ANY species:
cattle, buffalo, goat, sheep, horse, dog, cat, bird,
or any other animal.

The owner may speak in English, Hindi, Telugu,
or another language.

Your job is NOT to diagnose a disease.

Your job is to:
1. Identify animal species.
2. Extract observable symptoms.
3. Extract duration.
4. Identify potential emergency red flags.
5. Estimate urgency.
6. Identify missing information.
7. Ask one useful follow-up question if necessary.

Urgency must be exactly:
CRITICAL
URGENT
NON_URGENT
UNKNOWN

Do not provide a definitive disease diagnosis.
Do not prescribe medication.
Do not provide medication dosage.
Do not invent symptoms.
Base the assessment only on provided information.

Return ONLY JSON.

Expected structure:
{
  "animal": {
    "species": null
  },
  "symptoms": [],
  "duration": null,
  "red_flags": [],
  "urgency": "UNKNOWN",
  "confidence": 0.0,
  "missing_information": [],
  "follow_up_question": null,
  "reason": ""
}
"""


def clean_json_response(content: str) -> str:
    content = content.strip()
    content = re.sub(r"^```(?:json)?\s*", "", content, flags=re.IGNORECASE)
    content = re.sub(r"\s*```$", "", content)

    start = content.find("{")
    end = content.rfind("}")
    if start != -1 and end != -1:
        content = content[start : end + 1]

    return content.strip()


class LLMService:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "local").lower()
        if self.provider == "nvidia":
            base_url = os.getenv(
                "NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1"
            )
            self.model = os.getenv("NVIDIA_MODEL", "openai/gpt-oss-20b")
            self.api_key = os.getenv("NVIDIA_API_KEY", "")
        elif self.provider == "local":
            base_url = os.getenv(
                "LOCAL_LLM_BASE_URL", "http://127.0.0.1:8080/v1"
            )
            self.model = os.getenv(
                "LOCAL_LLM_MODEL", "google_gemma-4-E4B-it-Q4_K_M"
            )
            self.api_key = ""
        else:
            raise ValueError("LLM_PROVIDER must be 'local' or 'nvidia'.")

        self.url = f"{base_url.rstrip('/')}/chat/completions"

    def triage(self, user_text: str) -> dict[str, Any]:
        headers = {}
        if self.provider == "nvidia":
            if not self.api_key:
                raise ValueError("NVIDIA_API_KEY is required when LLM_PROVIDER=nvidia.")
            headers["Authorization"] = f"Bearer {self.api_key}"

        response = requests.post(
            self.url,
            headers=headers,
            json={
                "model": self.model,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_text},
                ],
                "temperature": 0.1,
                "max_tokens": 500,
            },
            timeout=120,
        )
        response.raise_for_status()

        data = response.json()
        content = data["choices"][0]["message"]["content"]
        cleaned = clean_json_response(content)

        try:
            result = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise ValueError(f"LLM returned invalid JSON: {exc}") from exc

        return result


llm_service = LLMService()