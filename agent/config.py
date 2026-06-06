"""
Single source of truth for all settings.
Reads from environment variables / .env file.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Required
    openai_api_key: str

    tavily_api_key: str

    # Agent
    model_name: str = "gpt-4o-mini"
    temperature: float = 0.1
    max_iterations: int = 10

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000

# Single shared instance — import this everywhere
settings = Settings()