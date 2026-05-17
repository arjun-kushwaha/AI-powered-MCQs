from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Powered LMS"
    api_prefix: str = "/api"
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60 * 24
    algorithm: str = "HS256"
    database_url: str = "sqlite:///./lms.db"
    ollama_url: str = "http://10.100.60.121:11434/api/generate"
    ollama_model: str = "llama3.1:latest"
    ollama_validator_model: str = "mistral:latest"
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://10.100.60.121:5173",
    ]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
