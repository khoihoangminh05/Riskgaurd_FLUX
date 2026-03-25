from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    GOOGLE_API_KEY: str = "AIzaSyCndNF2XPdZydXFra5p7UjTVAz05QC9j-Y"
    NESTJS_API_URL: str = "http://localhost:3000"
    DATABASE_URL: str = "postgresql://postgres:Khoi2106%40@localhost:5432/riskguard"

    class Config:
        env_file = ".env"

@lru_cache
def get_settings():
    return Settings()
