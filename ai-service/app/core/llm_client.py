import json
import re
import logging
import time
from typing import Type, TypeVar

import requests
from pydantic import BaseModel
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from app.core.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

MAX_RETRIES = 4
RETRY_BACKOFF_SEC = 2


class LLMClient:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = settings.OPENROUTER_BASE_URL.rstrip("/")
        self.model = settings.LLM_MODEL
        self.session = self._build_session()
        if self.api_key:
            logger.info("LLM client initialized with model: %s", self.model)
        else:
            logger.warning("OPENROUTER_API_KEY not set. Please add it to ai-service/.env file.")

    def _build_session(self) -> requests.Session:
        retry = Retry(
            total=MAX_RETRIES,
            connect=MAX_RETRIES,
            read=MAX_RETRIES,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["POST"],
            raise_on_status=False,
        )
        session = requests.Session()
        adapter = HTTPAdapter(max_retries=retry)
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        return session

    def clean_json_response(self, text: str) -> str:
        """Extract JSON string from markdown code blocks or raw string."""
        text = text.strip()
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        return text

    def _chat_completion(self, messages: list[dict]) -> str:
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is missing. Please configure it in ai-service/.env file.")

        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "AI Career Placement Copilot",
        }
        payload = {"model": self.model, "messages": messages}

        last_error: Exception | None = None

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                response = self.session.post(url, headers=headers, json=payload, timeout=120)
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
            except requests.exceptions.SSLError as exc:
                last_error = exc
                logger.warning("OpenRouter SSL error (attempt %s/%s): %s", attempt, MAX_RETRIES, exc)
            except requests.exceptions.ConnectionError as exc:
                last_error = exc
                logger.warning("OpenRouter connection error (attempt %s/%s): %s", attempt, MAX_RETRIES, exc)
            except requests.exceptions.Timeout as exc:
                last_error = exc
                logger.warning("OpenRouter timeout (attempt %s/%s): %s", attempt, MAX_RETRIES, exc)
            except requests.exceptions.HTTPError as exc:
                status = exc.response.status_code if exc.response is not None else "unknown"
                body = exc.response.text[:300] if exc.response is not None else ""
                if status in (429, 500, 502, 503, 504) and attempt < MAX_RETRIES:
                    last_error = exc
                    logger.warning("OpenRouter HTTP %s (attempt %s/%s)", status, attempt, MAX_RETRIES)
                else:
                    raise RuntimeError(
                        f"OpenRouter API error (HTTP {status}): {body or str(exc)}"
                    ) from exc
            except (KeyError, IndexError, ValueError) as exc:
                raise RuntimeError(f"Unexpected OpenRouter response format: {exc}") from exc

            if attempt < MAX_RETRIES:
                sleep_for = RETRY_BACKOFF_SEC * attempt
                time.sleep(sleep_for)

        raise RuntimeError(
            "Could not reach OpenRouter (SSL/network error). "
            "Check your internet connection, disable VPN/proxy if enabled, and retry. "
            f"Details: {last_error}"
        ) from last_error

    def generate_structured_output(self, prompt: str, schema_cls: Type[T]) -> T:
        """
        Sends a prompt to the LLM with strict JSON schema enforcement via Pydantic model.
        Parses and validates the response against `schema_cls`.
        """
        schema_json = json.dumps(schema_cls.model_json_schema(), indent=2)
        system_instruction = (
            "You are an expert AI Career Copilot. You MUST respond strictly in valid JSON format matching this JSON schema:\n"
            f"{schema_json}\n\n"
            "Do NOT include any commentary, introduction, or markdown wrapping outside the JSON. Return pure raw JSON only."
        )

        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt},
        ]

        try:
            raw_text = self._chat_completion(messages)
            cleaned_text = self.clean_json_response(raw_text)
            parsed_data = json.loads(cleaned_text)
            return schema_cls.model_validate(parsed_data)
        except RuntimeError:
            raise
        except Exception as e:
            logger.error("LLM structured output error: %s", e)
            raise RuntimeError(f"Failed to generate structured JSON output: {str(e)}") from e

    def generate_text(self, prompt: str, system_prompt: str = "") -> str:
        """Generate free-form text response from the LLM."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        return self._chat_completion(messages)


llm_client = LLMClient()
