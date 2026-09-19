import json
import re
import logging
import time
from typing import Any, Type, TypeVar

import requests
from pydantic import BaseModel
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from app.core.config import settings
from app.core.json_utils import loads_json_object

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

RETRY_BACKOFF_SEC = 2
JSON_OBJECT_RE = re.compile(r"\{[\s\S]*\}")


class LLMClient:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = settings.OPENROUTER_BASE_URL.rstrip("/")
        self.model = settings.LLM_MODEL
        self.max_retries = max(1, settings.LLM_MAX_RETRIES)
        self.session = self._build_session()
        if self.api_key:
            logger.info("LLM client initialized with model: %s", self.model)
        else:
            logger.warning("OPENROUTER_API_KEY not set. Please add it to ai-service/.env file.")

    def _build_session(self) -> requests.Session:
        retry = Retry(total=0)
        session = requests.Session()
        adapter = HTTPAdapter(max_retries=retry)
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        return session

    def _flatten_content(self, content: Any) -> str:
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            parts = []
            for item in content:
                if isinstance(item, str):
                    parts.append(item)
                elif isinstance(item, dict):
                    text = item.get("text") or item.get("content") or ""
                    if text:
                        parts.append(str(text))
            return "\n".join(parts)
        return ""

    def _extract_assistant_text(self, data: dict) -> tuple[str, str]:
        """Pull usable text from OpenRouter chat completions, including reasoning models."""
        choice = (data.get("choices") or [{}])[0]
        message = choice.get("message") or {}
        finish_reason = str(choice.get("finish_reason") or "")

        candidates = [
            self._flatten_content(message.get("content")),
            self._flatten_content(message.get("reasoning")),
            self._flatten_content(message.get("reasoning_content")),
            self._flatten_content(choice.get("text")),
        ]

        reasoning_details = message.get("reasoning_details") or []
        if isinstance(reasoning_details, list):
            for detail in reasoning_details:
                if isinstance(detail, dict):
                    candidates.append(self._flatten_content(detail.get("text") or detail.get("content")))

        for text in candidates:
            if isinstance(text, str) and text.strip():
                return text.strip(), finish_reason
        return "", finish_reason

    def clean_json_response(self, text: str) -> str:
        """Extract JSON string from markdown, reasoning text, or raw JSON."""
        if not isinstance(text, str) or not text.strip():
            raise RuntimeError("OpenRouter returned an empty response. Check the model, API key, and request limits.")
        text = text.strip()
        fenced = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
        if fenced:
            text = fenced.group(1).strip()
        if text.startswith("{") and text.endswith("}"):
            return text
        match = JSON_OBJECT_RE.search(text)
        if match:
            return match.group(0).strip()
        return text

    def _build_payload(self, messages: list[dict], max_tokens: int, json_mode: bool = False) -> dict:
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.2,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        # Reasoning models can consume the entire budget on thinking and leave content empty.
        if any(token in self.model.lower() for token in ("deepseek", "reason", "r1")):
            reasoning_budget = max(256, min(1024, max_tokens // 4))
            payload["reasoning"] = {"max_tokens": reasoning_budget}
        return payload

    def _chat_completion(self, messages: list[dict], json_mode: bool = False) -> str:
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is missing. Please configure it in ai-service/.env file.")

        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "AI Career Placement Copilot",
        }

        last_error: Exception | None = None
        max_tokens = settings.LLM_MAX_TOKENS
        disable_reasoning = False

        for attempt in range(1, self.max_retries + 1):
            try:
                payload = self._build_payload(messages, max_tokens, json_mode=json_mode)
                if disable_reasoning:
                    payload.pop("reasoning", None)
                response = self.session.post(
                    url,
                    headers=headers,
                    json=payload,
                    timeout=settings.LLM_TIMEOUT_SEC,
                )
                response.raise_for_status()
                data = response.json()
                content, finish_reason = self._extract_assistant_text(data)
                if not content:
                    logger.warning(
                        "Empty OpenRouter content (attempt %s/%s, finish_reason=%s, keys=%s)",
                        attempt,
                        self.max_retries,
                        finish_reason,
                        list((data.get("choices") or [{}])[0].get("message") or {}).keys(),
                    )
                    if finish_reason == "length" or attempt < self.max_retries:
                        last_error = RuntimeError("OpenRouter returned an empty message content.")
                        max_tokens = min(max_tokens * 2, 8192)
                    else:
                        raise RuntimeError(
                            "OpenRouter returned an empty message content. "
                            "The model may be a reasoning model that used all tokens on thinking, "
                            "or the API key/credits may be invalid. Increase LLM_MAX_TOKENS and retry."
                        )
                else:
                    if finish_reason == "length":
                        logger.warning("OpenRouter response was truncated (finish_reason=length).")
                    return content
            except requests.exceptions.SSLError as exc:
                last_error = exc
                logger.warning("OpenRouter SSL error (attempt %s/%s): %s", attempt, self.max_retries, exc)
            except requests.exceptions.ConnectionError as exc:
                last_error = exc
                logger.warning("OpenRouter connection error (attempt %s/%s): %s", attempt, self.max_retries, exc)
            except requests.exceptions.Timeout as exc:
                last_error = exc
                logger.warning("OpenRouter timeout (attempt %s/%s): %s", attempt, self.max_retries, exc)
            except requests.exceptions.HTTPError as exc:
                status = exc.response.status_code if exc.response is not None else "unknown"
                body = exc.response.text[:300] if exc.response is not None else ""
                if status == 401:
                    raise RuntimeError(
                        "OpenRouter API key is invalid or expired. Replace OPENROUTER_API_KEY in ai-service/.env."
                    ) from exc
                if status == 402:
                    raise RuntimeError(
                        "OpenRouter credits are exhausted. Add credits or switch LLM_MODEL in ai-service/.env."
                    ) from exc
                if status == 400 and json_mode and "response_format" in str(body).lower() and attempt < self.max_retries:
                    json_mode = False
                    last_error = exc
                    logger.warning("OpenRouter rejected json_object mode; retrying without it.")
                elif status == 400 and not disable_reasoning and attempt < self.max_retries:
                    disable_reasoning = True
                    last_error = exc
                    logger.warning("OpenRouter HTTP 400; retrying without reasoning params. Body: %s", body)
                elif status in (429, 500, 502, 503, 504) and attempt < self.max_retries:
                    last_error = exc
                    logger.warning("OpenRouter HTTP %s (attempt %s/%s)", status, attempt, self.max_retries)
                else:
                    raise RuntimeError(
                        f"OpenRouter API error (HTTP {status}): {body or str(exc)}"
                    ) from exc
            except RuntimeError:
                raise
            except (KeyError, IndexError, ValueError) as exc:
                raise RuntimeError(f"Unexpected OpenRouter response format: {exc}") from exc

            if attempt < self.max_retries:
                time.sleep(RETRY_BACKOFF_SEC * attempt)

        raise RuntimeError(
            "Could not complete OpenRouter request. "
            "Check internet, API key, credits, and LLM_MAX_TOKENS. "
            f"Details: {last_error}"
        ) from last_error

    def generate_structured_output(self, prompt: str, schema_cls: Type[T]) -> T:
        """
        Sends a prompt to the LLM with strict JSON schema enforcement via Pydantic model.
        Parses and validates the response against `schema_cls`.
        """
        schema_json = json.dumps(schema_cls.model_json_schema(), indent=2)
        compact_rules = (
            "Keep JSON compact. No trailing commas. Escape quotes inside strings. "
            "Prefer short strings. Do not add extra keys."
        )
        system_instruction = (
            "You are an expert AI Career Copilot. You MUST respond strictly in valid JSON format matching this JSON schema:\n"
            f"{schema_json}\n\n"
            f"{compact_rules}\n"
            "Do NOT include any commentary, introduction, or markdown wrapping outside the JSON. Return pure raw JSON only."
        )

        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt},
        ]

        last_error: Exception | None = None
        for attempt in range(1, 3):
            try:
                user_prompt = prompt if attempt == 1 else (
                    prompt
                    + "\n\nCRITICAL: Previous JSON was invalid or truncated. "
                    "Return a SMALLER valid JSON object. Limit nested lists. Keep strings short."
                )
                messages[1] = {"role": "user", "content": user_prompt}
                raw_text = self._chat_completion(messages, json_mode=True)
                parsed_data = loads_json_object(raw_text)
                return schema_cls.model_validate(parsed_data)
            except RuntimeError:
                raise
            except Exception as e:
                last_error = e
                logger.warning("LLM structured output attempt %s failed: %s", attempt, e)

        raise RuntimeError(f"Failed to parse structured JSON output: {last_error}") from last_error

    def generate_text(self, prompt: str, system_prompt: str = "") -> str:
        """Generate free-form text response from the LLM."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        return self._chat_completion(messages)


llm_client = LLMClient()
