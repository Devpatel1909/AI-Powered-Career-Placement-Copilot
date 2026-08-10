import json
import re
import logging
from typing import Type, TypeVar

import requests
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class LLMClient:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = settings.OPENROUTER_BASE_URL.rstrip("/")
        self.model = settings.LLM_MODEL
        if self.api_key:
            logger.info(f"LLM client initialized with model: {self.model}")
        else:
            logger.warning("OPENROUTER_API_KEY not set. Please add it to ai-service/.env file.")

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

        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "AI Career Placement Copilot",
            },
            json={
                "model": self.model,
                "messages": messages,
            },
            timeout=120,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]

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
        except Exception as e:
            logger.error(f"LLM structured output error: {e}")
            raise RuntimeError(f"Failed to generate structured JSON output: {str(e)}")

    def generate_text(self, prompt: str, system_prompt: str = "") -> str:
        """Generate free-form text response from the LLM."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        return self._chat_completion(messages)


llm_client = LLMClient()
