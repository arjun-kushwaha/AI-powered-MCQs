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


async def _generate_mcq_batch(client: httpx.AsyncClient, source_text: str, title: str, batch_size: int, difficulty: str) -> list[dict[str, Any]]:
    prompt = f"""
You are an expert educator generating high-quality, strictly unique multiple choice questions.
Return ONLY strict JSON with this exact shape, no markdown formatting, no explanation outside JSON:
{{
  "questions": [
    {{
      "prompt": "clear, unambiguous question text",
      "difficulty": "{difficulty}",
      "explanation": "concise explanation of why the correct answer is right",
      "correct_option_key": "A",
      "options": [
        {{"option_key": "A", "option_text": "plausible option text"}},
        {{"option_key": "B", "option_text": "plausible option text"}},
        {{"option_key": "C", "option_text": "plausible option text"}},
        {{"option_key": "D", "option_text": "plausible option text"}}
      ]
    }}
  ]
}}

Rules:
- Generate EXACTLY {batch_size} UNIQUE questions.
- Focus strictly on the title: {title}
- Use ONLY the provided syllabus or topic text:
{source_text}
- Ensure correct answers are 100% accurate according to the text.
- Do not repeat any concepts if possible.
- Each question must have exactly 4 options.
- Only ONE option is correct.
- Do NOT output markdown fences (like ```json).
""".strip()

    payload = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7
        }
    }

    try:
        response = await client.post(settings.ollama_url, json=payload)
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"Ollama request failed or timed out: {str(exc)}",
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Ollama request failed with status {response.status_code}",
        )

    body = response.json()
    raw_text = body.get("response", "")
    try:
        json_blob = _extract_json_blob(raw_text)
        parsed = json.loads(json_blob)
        questions = parsed.get("questions", [])
    except (json.JSONDecodeError, KeyError, TypeError, HTTPException):
        return []

    validated_questions = []
    for item in questions:
        if not isinstance(item, dict): continue
        options = item.get("options", [])
        if not isinstance(options, list) or len(options) != 4:
            continue

        option_keys = [opt.get("option_key") for opt in options if isinstance(opt, dict)]
        if option_keys != ["A", "B", "C", "D"]:
            continue

        correct_key = item.get("correct_option_key")
        if correct_key not in option_keys:
            continue
            
        if not item.get("prompt"):
            continue

        validated_questions.append(item)

    return validated_questions

async def generate_mcqs(source_text: str, title: str, question_count: int, difficulty: str) -> list[dict[str, Any]]:
    batch_size = 10
    all_validated_questions = []
    seen_prompts = set()
    
    max_attempts = (question_count // batch_size) + 5 
    attempts = 0
    
    async with httpx.AsyncClient(timeout=300.0) as client:
        while len(all_validated_questions) < question_count and attempts < max_attempts:
            needed = question_count - len(all_validated_questions)
            current_batch_size = min(batch_size, needed + 2) 
            
            batch_qs = await _generate_mcq_batch(
                client=client, 
                source_text=source_text, 
                title=title, 
                batch_size=current_batch_size, 
                difficulty=difficulty
            )
            
            for q in batch_qs:
                prompt_text = q.get("prompt", "").strip().lower()
                if prompt_text not in seen_prompts:
                    seen_prompts.add(prompt_text)
                    all_validated_questions.append(q)
                    if len(all_validated_questions) == question_count:
                        break
                        
            attempts += 1

    if not all_validated_questions:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Model returned incomplete or invalid MCQ data across multiple attempts",
        )

    return all_validated_questions[:question_count]
