# FinSolve RBAC Chatbot — Architecture Diagram
# Mermaid diagram for presentation slides

```mermaid
flowchart TD
    subgraph UI["⚛️ React Frontend (Vite + Tailwind)"]
        L[Login Page\nQuick Demo Buttons] --> AUTH
        CHAT[Chat Interface\nSidebar + Sources + Typing] 
    end

    subgraph AUTH["🔐 Authentication"]
        JWT[JWT Token\npython-jose]
        USERS[(users.json\n6 roles)]
        JWT --> USERS
    end

    subgraph API["⚙️ FastAPI Backend"]
        EP1[POST /login]
        EP2[POST /chat]
        EP3[GET /me]
    end

    subgraph PIPELINE["🧠 RAG Pipeline"]
        G[🛡️ Guardrails\nAnti-injection\nOff-topic filter]
        RBAC[🔒 RBAC Filter\nRole → Departments]
        EMB[🔢 Embeddings\nall-MiniLM-L6-v2\nlocal, no API]
        VDB[(🗄️ Qdrant\nVector Store\n265 chunks)]
        LLM[⚡ Groq LLM\ngpt-oss-120b\nFast inference]
    end

    subgraph DATA["📁 Knowledge Base"]
        F[finance/\n2 files · 34 chunks]
        H[hr/\n1 file · 101 chunks]
        M[marketing/\n5 files · 59 chunks]
        E[engineering/\n1 file · 48 chunks]
        GEN[general/\n1 file · 23 chunks]
    end

    L -->|credentials| EP1
    EP1 -->|JWT token| L
    CHAT -->|query + Bearer token| EP2
    EP2 --> G
    G -->|safe query| RBAC
    RBAC -->|allowed departments| EMB
    EMB -->|query vector| VDB
    VDB -->|top-K chunks| LLM
    LLM -->|answer + sources| EP2
    EP2 --> CHAT

    DATA --> VDB

    style UI fill:#EEF2FF,stroke:#6366F1
    style API fill:#F0FDF4,stroke:#22C55E
    style PIPELINE fill:#FFF7ED,stroke:#F59E0B
    style DATA fill:#F0F9FF,stroke:#0EA5E9
    style AUTH fill:#FDF4FF,stroke:#A855F7
```

## Roles & Access Matrix

| Document | employee | hr | marketing | finance | engineering | c_level |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| employee_handbook.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| hr_data.csv | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| financial_*.md | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| marketing_*.md | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| engineering_*.md | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

## Tech Stack Summary

| Layer | Technology | Why |
|-------|-----------|-----|
| LLM | Groq (gpt-oss-120b) | Free tier, fast |
| Embeddings | all-MiniLM-L6-v2 | Local, no cost |
| Vector Store | Qdrant (local) | No MSVC, RBAC filter |
| Backend | FastAPI + JWT | REST API, auto-docs |
| Frontend | React + Tailwind + Vite | Modern, fast |
| Guardrails | Custom (regex + keywords) | No extra cost |

## RAG Flow (step by step)

```
1. User logs in → JWT token (role embedded)
2. User sends query → POST /chat with Bearer token
3. FastAPI decodes JWT → extracts role
4. Guardrails check → block injections, off-topic
5. RBAC lookup → ["finance", "general"] for finance role
6. all-MiniLM-L6-v2 → embeds the query (384 dimensions)
7. Qdrant query → filter by department IN allowed_list
8. Top-5 chunks returned → with relevance scores
9. Prompt built → [SYSTEM] + [CONTEXT chunks] + [QUESTION]
10. Groq LLM → generates answer (temp=0.1, factual)
11. Response → answer text + source files + relevance %
```
