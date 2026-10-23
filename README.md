# 🏦 FinSolve Technologies — AI RBAC Chatbot

> **RAG-based Role-Based Access Control chatbot** | FinTech | Codebasics Resume Project Challenge

Un chatbot interne propulsé par l'IA qui permet à chaque employé d'accéder uniquement aux données de son département, avec une interface React moderne et un pipeline RAG performant.

---

## 🎯 Fonctionnalités

- 🔐 **Authentification JWT** — Login sécurisé avec tokens Bearer
- 👥 **RBAC complet** — 6 rôles avec accès cloisonnés aux données
- 🧠 **Pipeline RAG** — Retrieval Augmented Generation avec LangChain
- ⚡ **Groq LLM** — Réponses en temps réel (Llama 3.3-70b)
- 🗄️ **ChromaDB** — Recherche vectorielle locale avec filtrage par métadonnées
- 🛡️ **Guardrails** — Protection contre injections et requêtes hors-sujet
- 📄 **Citations sources** — Chaque réponse indique le fichier source
- 💻 **Interface React** — UI moderne avec Tailwind CSS

---

## 🗂️ Rôles et Accès

| Rôle | Données accessibles | Compte démo |
|------|-------------------|-------------|
| 👑 C-Level | Tout | `tony_sharma / tony123` |
| 💰 Finance | Rapports financiers | `sarah_finance / finance123` |
| 📣 Marketing | Rapports marketing | `mike_marketing / market123` |
| 👥 HR | Données RH | `lisa_hr / hr123` |
| ⚙️ Engineering | Docs techniques | `dev_peter / eng123` |
| 🙋 Employee | Handbook général | `emp_john / emp123` |

---

## 🛠️ Tech Stack

| Couche | Technologie |
|--------|------------|
| LLM | Groq API — Llama 3.3-70b-versatile |
| Embeddings | sentence-transformers/all-MiniLM-L6-v2 (local) |
| Vector Store | ChromaDB (persistant local) |
| Orchestration | LangChain |
| Backend | FastAPI + Uvicorn |
| Auth | JWT (python-jose) |
| Frontend | React + Tailwind CSS + Vite |

---

## 🚀 Installation

### 1. Cloner et naviguer
```bash
cd DS-RPC-01
```

### 2. Backend Python
```bash
# Créer et activer le venv
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
# Copier .env.example → .env et remplir GROQ_API_KEY
```

### 3. Obtenir une clé Groq (gratuit)
1. Aller sur [console.groq.com](https://console.groq.com)
2. Créer un compte → API Keys → Create API Key
3. Copier dans `.env` : `GROQ_API_KEY=gsk_...`

### 4. Indexer les documents
```bash
# Depuis la racine du projet, avec le venv activé
python -m ingestion.ingest_docs
```

### 5. Démarrer le backend
```bash
uvicorn backend.main:app --reload --port 8000
```

### 6. Démarrer le frontend
```bash
cd frontend
npm install
npm run dev
```

### 7. Accéder à l'application
- **Frontend** : http://localhost:5173
- **API Docs** : http://localhost:8000/docs

---

## 📁 Structure du Projet

```
DS-RPC-01/
├── backend/
│   ├── main.py           # FastAPI app + endpoints
│   ├── auth.py           # JWT authentication
│   ├── rag_pipeline.py   # RAG core (Guardrails → ChromaDB → Groq)
│   ├── vector_store.py   # ChromaDB wrapper
│   ├── guardrails.py     # Security validation
│   ├── config.py         # Configuration + RBAC mapping
│   └── users.json        # Demo users database
├── ingestion/
│   └── ingest_docs.py    # Document indexing script
├── frontend/
│   └── src/
│       ├── pages/        # LoginPage, ChatPage
│       ├── context/      # AuthContext (JWT state)
│       ├── services/     # API calls
│       └── constants/    # Role configs, suggestions
├── data/
│   ├── finance/          # Rapports financiers
│   ├── hr/               # Données RH
│   ├── marketing/        # Rapports marketing
│   ├── engineering/      # Documentation technique
│   └── general/          # Employee handbook
├── .env                  # Variables d'environnement (ne pas committer)
└── requirements.txt
```

---

## 🔄 Architecture RAG

```
Query → Guardrails → Embed → ChromaDB[RBAC filter] → Top-K chunks → Groq LLM → Response + Sources
```

---

## 📊 Évaluation

Le projet implémente tous les critères requis :
- ✅ Authentification JWT + RBAC
- ✅ RAG avec LangChain + ChromaDB
- ✅ LLM Groq (Llama 3.3-70b)
- ✅ Guardrails de sécurité
- ✅ Citations des sources
- ✅ Interface utilisateur React
- ✅ API REST FastAPI documentée

---

*Développé par Peter Pandey — FinSolve Technologies AI Engineer*
