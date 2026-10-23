import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
LLM_MODEL: str = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

SECRET_KEY: str = os.getenv("SECRET_KEY", "finsolve_secret_key")
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

CHROMA_DB_PATH: str = os.getenv("CHROMA_DB_PATH", "./chroma_db")
CHROMA_COLLECTION_NAME: str = os.getenv("CHROMA_COLLECTION_NAME", "finsolve_docs")
TOP_K_RESULTS: int = int(os.getenv("TOP_K_RESULTS", "5"))

DATA_PATH: str = os.getenv("DATA_PATH", "./data")

DEPARTMENT_ROLES: dict[str, list[str]] = {
    "finance":     ["finance", "c_level"],
    "hr":          ["hr", "c_level"],
    "marketing":   ["marketing", "c_level"],
    "engineering": ["engineering", "c_level"],
    "general":     ["employee", "hr", "marketing", "finance", "engineering", "c_level"],
}

ROLE_DEPARTMENTS: dict[str, list[str]] = {
    "c_level":     ["finance", "hr", "marketing", "engineering", "general"],
    "finance":     ["finance", "general"],
    "hr":          ["hr", "general"],
    "marketing":   ["marketing", "general"],
    "engineering": ["engineering", "general"],
    "employee":    ["general"],
}
