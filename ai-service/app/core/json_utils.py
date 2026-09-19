import json
import re
from typing import Any


def extract_json_text(text: str) -> str:
    if not isinstance(text, str) or not text.strip():
        raise ValueError("Empty LLM response")
    text = text.strip()
    fenced = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
    if fenced:
        text = fenced.group(1).strip()
    start = text.find("{")
    if start == -1:
        return text
    return text[start:]


def _remove_trailing_commas(text: str) -> str:
    return re.sub(r",(\s*[}\]])", r"\1", text)


def _close_truncated_json(text: str) -> str:
    stack: list[str] = []
    in_str = False
    escape = False
    for ch in text:
        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch == "{":
            stack.append("}")
        elif ch == "[":
            stack.append("]")
        elif ch in "}]" and stack and stack[-1] == ch:
            stack.pop()

    if in_str:
        text += '"'
    text = text.rstrip()
    text = re.sub(r",\s*$", "", text)
    while stack:
        text += stack.pop()
    return text


def loads_json_object(text: str) -> dict[str, Any]:
    cleaned = extract_json_text(text)
    candidates = [cleaned, _remove_trailing_commas(cleaned), _close_truncated_json(_remove_trailing_commas(cleaned))]
    last_error: Exception | None = None
    for candidate in candidates:
        try:
            parsed = json.loads(candidate)
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError as exc:
            last_error = exc
    raise json.JSONDecodeError(
        getattr(last_error, "msg", "Invalid JSON"),
        cleaned,
        getattr(last_error, "pos", 0),
    ) from last_error
