from typing import Optional
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.auth import UserLogin, authenticate_user, get_current_user
from backend.rag_pipeline import run_rag_pipeline
from backend.vector_store import get_collection_stats

app = FastAPI(
    title="FinSolve RBAC Chatbot API",
    description="RAG-based enterprise assistant with role-based access control",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    query: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]
    guardrail_triggered: bool
    context_found: bool
    chunks_retrieved: Optional[int] = 0
    user_role: str
    user_name: str


@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "service": "FinSolve Chatbot API"}


@app.post("/login", tags=["Auth"])
def login(credentials: UserLogin):
    return authenticate_user(credentials.username, credentials.password)


@app.get("/me", tags=["Auth"])
def get_profile(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user["username"],
        "name": current_user["name"],
        "role": current_user["role"],
        "title": current_user["title"],
        "department": current_user["department"],
    }


@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    result = run_rag_pipeline(
        query=request.query,
        user=current_user,
    )
    return ChatResponse(
        answer=result["answer"],
        sources=result["sources"],
        guardrail_triggered=result["guardrail_triggered"],
        context_found=result["context_found"],
        chunks_retrieved=result.get("chunks_retrieved", 0),
        user_role=current_user["role"],
        user_name=current_user["name"],
    )


@app.get("/stats", tags=["System"])
def get_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "c_level":
        raise HTTPException(status_code=403, detail="Access restricted to C-Level executives")
    return get_collection_stats()
