# FinSolve Technologies — AI RBAC Assistant

> **RAG-based Role-Based Access Control Chatbot** | FinTech Knowledge Platform

An enterprise internal AI assistant designed to allow employees to access only their department-authorized documents through a high-performance RAG pipeline and role-based vector filtering.

---

## Key Features

- **JWT Authentication** — Secure login with bearer tokens and role-based permissions.
- **Enterprise RBAC** — 6 distinct privilege tiers with strictly partitioned data access.
- **RAG Pipeline** — Context-grounded retrieval using dense embeddings and semantic vector search.
- **Groq LLM Acceleration** — Real-time inference powered by LLaMA 3.3 70B Versatile.
- **Vector Store** — Persistent local vector storage with metadata pre-filtering.
- **Security Guardrails** — Input sanitization protecting against prompt injections and out-of-scope queries.
- **Source Verification** — Citations and department metadata included with every response.
- **Modern Interface** — Responsive dark-mode interface built with React, Vite, and Tailwind CSS.

---

## Roles and Data Access

| Role | Accessible Data | Demo Account |
|------|-----------------|--------------|
| C-Level | Cross-departmental (All data) | `famakan_clevel / famakan_clevel123` |
| Finance | Quarterly financial reports, margins, budgets | `famakan_finance / famakan_finance123` |
| Marketing | Campaign ROI, acquisition targets, marketing spend | `famakan_marketing / famakan_marketing123` |
| HR | Employee records, payroll, retention metrics | `famakan_hr / famakan_hr123` |
| Engineering | Microservices, architecture, CI/CD, PCI-DSS compliance | `famakan_engineering / famakan_engineering123` |
| Employee | General policies, onboarding, employee handbook | `famakan_employee / famakan_employee123` |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| LLM | Groq API — LLaMA 3.3 70B Versatile |
| Embeddings | sentence-transformers/all-MiniLM-L6-v2 (local) |
| Vector Store | ChromaDB / Qdrant (local persistent) |
| Backend | FastAPI + Uvicorn |
| Auth | JWT (python-jose) |
| Frontend | React + Tailwind CSS + Vite |

---

## Installation & Setup

### 1. Clone repository
```bash
git clone https://github.com/TheRealFamakan/RBAC.git
cd RBAC
```

### 2. Python Backend
```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example to .env and insert your GROQ_API_KEY
```

### 3. Ingest documents
```bash
python -m ingestion.ingest_docs
```

### 4. Start backend server
```bash
python run.py
```

### 5. Start frontend client
```bash
cd frontend
npm install
npm run dev
```

### 6. Access application
- **Frontend** : http://localhost:5173
- **API Docs** : http://127.0.0.1:8000/docs

---

## Project Structure

```
RBAC/
├── backend/
│   ├── main.py           # FastAPI app and route handlers
│   ├── auth.py           # JWT authentication and user lookup
│   ├── rag_pipeline.py   # RAG pipeline with Groq and guardrails
│   ├── vector_store.py   # Vector store wrapper and RBAC filter
│   ├── guardrails.py     # Prompt injection and relevance checks
│   ├── config.py         # App configuration and role mapping
│   └── users.json        # Verified demo user accounts
├── ingestion/
│   └── ingest_docs.py    # Document chunking and indexing script
├── frontend/
│   └── src/
│       ├── pages/        # LoginPage, ChatPage
│       ├── context/      # AuthContext state management
│       ├── services/     # API service client
│       └── constants/    # Department configurations and questions
├── data/
│   ├── finance/          # Financial summaries and quarterly reports
│   ├── hr/               # HR employee records
│   ├── marketing/        # Marketing campaign reports
│   ├── engineering/      # Engineering architecture documents
│   └── general/          # Employee handbook and company policies
├── evaluation/
│   ├── evaluate.py       # RAGAS evaluation runner
│   └── results.json      # Benchmark evaluation metrics (84.8%)
├── .env.example          # Environment template
└── requirements.txt
```

---

## Evaluation Benchmark

The system has been evaluated on standard enterprise RAG criteria:
- **Factual Faithfulness**: 100% (zero hallucination detected)
- **Role-Access Isolation**: 100% (strict RBAC boundary enforcement)
- **Semantic Answer Relevance**: 82.5%
- **Overall Score**: 84.8% (EXCELLENT)

---

*FinSolve Technologies AI Assistant — Developed by Famakan*
