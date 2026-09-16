import requests
import json

SYSTEM_PROMPT = """
You are an AI veterinary emergency triage assistant.

You help animal owners describe health problems to a veterinarian.

The animal can be ANY species, including cattle, buffalo,
goats, sheep, horses, dogs, cats, birds, or other animals.

The owner may describe the problem in English or another language.

Your job is NOT to diagnose the disease.

Your job is to:
1. Identify the animal species if possible.
2. Extract observable symptoms.
3. Extract duration if mentioned.
4. Identify potential emergency red flags.
5. Estimate urgency.
6. Identify missing information.

Urgency must be exactly one of:
CRITICAL
URGENT
NON_URGENT
UNKNOWN

If there is insufficient information, use UNKNOWN
and provide a useful follow-up question.

Never provide a definitive diagnosis.
Never prescribe medication.

Return ONLY valid JSON using this structure:

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

user_message = """
My cow has not eaten anything since yesterday and
she is unable to stand properly. She is lying down
most of the time.
"""

response = requests.post(
    "http://127.0.0.1:8080/v1/chat/completions",
    json={
        "messages": [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": user_message
            }
        ],
        "temperature": 0.1,
        "max_tokens": 500
    },
    timeout=120
)

response.raise_for_status()

data = response.json()

content = data["choices"][0]["message"]["content"]

print("\n===== RAW MODEL RESPONSE =====\n")
print(content)

print("\n===== PARSED JSON =====\n")

try:
    result = json.loads(content)
    print(json.dumps(result, indent=2, ensure_ascii=False))
except json.JSONDecodeError:
    print("⚠️ Model did not return valid JSON.")