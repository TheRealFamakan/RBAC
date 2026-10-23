from typing import Optional
from groq import Groq

from backend.config import GROQ_API_KEY, LLM_MODEL, ROLE_DEPARTMENTS
from backend.vector_store import search_documents
from backend.guardrails import validate_query

_groq_client: Optional[Groq] = None


def get_groq_client() -> Groq:
    global _groq_client
    if _groq_client is None:
        _groq_client = Groq(api_key=GROQ_API_KEY)
    return _groq_client


SYSTEM_PROMPT = """You are FinSolve Assistant, the official enterprise AI assistant for FinSolve Technologies.

MANDATORY LANGUAGE POLICY:
- You must ALWAYS and EXCLUSIVELY respond in English.
- NEVER output responses in French or any other language, under any circumstances. Even if the user query contains non-English words, typos, or greetings, your entire reply must be 100% in English.

STRICT OPERATIONAL RULES:
1. Answer ONLY based on the provided AVAILABLE CONTEXT.
2. If the context does not contain the required information, state clearly: "I could not find information on this topic in the data accessible for your role."
3. Never fabricate, extrapolate, or guess information beyond the provided facts.
4. Always cite the verified source file name(s) at the end of your response.
5. If the user asks for data outside their role permissions, politely direct them to the appropriate department.
6. Maintain a professional, concise, and structured tone.

RESPONSE FORMAT:
- Structured response with bullet points where appropriate
- **Source:** [file name(s)]
"""


def build_user_prompt(query: str, context_chunks: list[dict]) -> str:
    if not context_chunks:
        return f"""AVAILABLE CONTEXT:
No information found in the data accessible for your role.

USER QUESTION: {query}

INSTRUCTION: Answer strictly in English. State that no data was found for this role."""

    context_parts = []
    for i, chunk in enumerate(context_chunks, 1):
        context_parts.append(
            f"[Source {i}: {chunk['source']}]\n{chunk['content']}"
        )

    context_str = "\n\n---\n\n".join(context_parts)

    return f"""AVAILABLE CONTEXT:
{context_str}

USER QUESTION: {query}

MANDATORY INSTRUCTION: Answer strictly based on the context above. Your entire response MUST be written exclusively in English."""


def run_rag_pipeline(query: str, user: dict) -> dict:
    role = user.get("role", "employee")

    guard_result = validate_query(query)
    if not guard_result.is_safe:
        return {
            "answer": f"[Security Notice] {guard_result.reason}\n\nRecommendation: {guard_result.suggestion}",
            "sources": [],
            "guardrail_triggered": True,
            "context_found": False,
        }

    allowed_departments = ROLE_DEPARTMENTS.get(role, ["general"])
    context_chunks = search_documents(
        query=query,
        role=role,
        allowed_departments=allowed_departments,
    )

    user_prompt = build_user_prompt(query, context_chunks)
    client = get_groq_client()
    response = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.1,
        max_tokens=1024,
    )

    answer = response.choices[0].message.content

    sources = []
    seen = set()
    for chunk in context_chunks:
        src = chunk["source"]
        if src not in seen:
            seen.add(src)
            sources.append({
                "file": src,
                "department": chunk["department"],
                "relevance": chunk["relevance_score"],
            })

    return {
        "answer": answer,
        "sources": sources,
        "guardrail_triggered": False,
        "context_found": len(context_chunks) > 0,
        "chunks_retrieved": len(context_chunks),
    }
