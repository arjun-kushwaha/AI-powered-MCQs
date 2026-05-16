import json
from typing import Any

import httpx
from fastapi import HTTPException, status

from app.core.config import settings


def _extract_json_blob(text: str) -> str:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Model did not return valid JSON output",
        )
    return text[start : end + 1]


async def generate_mcqs(source_text: str, title: str, question_count: int, difficulty: str) -> list[dict[str, Any]]:
    prompt = f"""
You are generating high-quality multiple choice questions for a learning management system.
Return only strict JSON with this shape:
{{
  "questions": [
    {{
      "prompt": "question text",
      "difficulty": "{difficulty}",
      "explanation": "short explanation",
      "correct_option_key": "A",
      "options": [
        {{"option_key": "A", "option_text": "option text"}},
        {{"option_key": "B", "option_text": "option text"}},
        {{"option_key": "C", "option_text": "option text"}},
        {{"option_key": "D", "option_text": "option text"}}
      ]
    }}
  ]
}}

Rules:
- Generate exactly {question_count} questions
- Focus on this title: {title}
- Use this syllabus or topic text:
{source_text}
- Each question must have exactly 4 options
- Only one option is correct
- Ensure questions are clear and non-ambiguous
- Explanation should be concise
- Do not add markdown fences
""".strip()

    payload = {"model": settings.ollama_model, "prompt": prompt, "stream": False}

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(settings.ollama_url, json=payload)

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Ollama request failed with status {response.status_code}",
        )

    body = response.json()
    raw_text = body.get("response", "")
    json_blob = _extract_json_blob(raw_text)

    try:
        parsed = json.loads(json_blob)
        questions = parsed["questions"]
    except (json.JSONDecodeError, KeyError, TypeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to parse MCQ response from Ollama",
        ) from exc

    validated_questions: list[dict[str, Any]] = []
    for item in questions:
        options = item.get("options", [])
        if len(options) != 4:
            continue

        option_keys = [option.get("option_key") for option in options]
        if option_keys != ["A", "B", "C", "D"]:
            continue

        correct_key = item.get("correct_option_key")
        if correct_key not in option_keys:
            continue

        validated_questions.append(item)

    if len(validated_questions) != question_count:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Model returned incomplete or invalid MCQ data",
        )

    return validated_questions
