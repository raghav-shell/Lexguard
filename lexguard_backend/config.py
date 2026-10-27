"""Deployment limits are bounded; secrets are never sent to clients."""
import os
from dataclasses import dataclass


def number(name: str, default: int, minimum: int, maximum: int) -> int:
    value = int(os.getenv(name, str(default)))
    if not minimum <= value <= maximum:
        raise ValueError(f"{name} must be between {minimum} and {maximum}")
    return value


def configured(name: str) -> bool:
    value = os.getenv(name, "").strip()
    return bool(value and not value.startswith("your_") and not value.startswith("replace-"))


@dataclass(frozen=True)
class Settings:
    max_file_bytes: int = 10 * 1024 * 1024
    max_text_chars: int = 80000
    batch_chars: int = 20000
    max_pages: int = 80
    parser_seconds: int = 10
    analysis_seconds: int = 160
    primary_seconds: int = 30
    secondary_seconds: int = 20
    max_concurrent: int = 2
    hourly_limit: int = 10
    global_hourly_limit: int = 60
    api_key: str = ""
    production: bool = False

    @classmethod
    def from_env(cls):
        return cls(
            max_concurrent=number("MAX_CONCURRENT_ANALYSES", 2, 1, 4),
            hourly_limit=number("ANALYSES_PER_HOUR", 10, 1, 1000),
            global_hourly_limit=number("GLOBAL_ANALYSES_PER_HOUR", 60, 1, 10000),
            api_key=os.getenv("ANALYSIS_API_KEY", "").strip(),
            production=os.getenv("ENVIRONMENT", "development") == "production",
        )
