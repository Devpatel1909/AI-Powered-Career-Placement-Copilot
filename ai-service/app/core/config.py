import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "deepseek/deepseek-v4-flash")
    OPENROUTER_BASE_URL: str = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    LLM_TIMEOUT_SEC: int = int(os.getenv("LLM_TIMEOUT_SEC", 120))
    LLM_MAX_RETRIES: int = int(os.getenv("LLM_MAX_RETRIES", 3))
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", 4096))
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    CHROMA_DB_DIR: str = os.getenv("CHROMA_DB_DIR", "./chroma_db")

settings = Settings()
