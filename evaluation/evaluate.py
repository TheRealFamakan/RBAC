import sys
import os
import json
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv()

# --- Dataset de test ---
# Questions avec ground truth par role adaptees aux documents indexes

TEST_CASES = [
    # Finance
    {
        "role": "finance",
        "question": "What is the Q3 2024 revenue?",
        "ground_truth": "The Q3 2024 revenue is $2.4 billion, representing a 30% year-over-year growth.",
    },
    {
        "role": "finance",
        "question": "What are the main quarterly expense categories in 2024?",
        "ground_truth": "The main quarterly expense categories include Vendor Services, Employee Benefits & HR, Software Subscriptions, and Other Operational Expenses.",
    },
    {
        "role": "finance",
        "question": "What is the gross margin for Q2 2024?",
        "ground_truth": "The gross margin for Q2 2024 is 60%, driven by higher-margin product offerings and operational efficiencies.",
    },
    # HR
    {
        "role": "hr",
        "question": "How many total employee records are in the HR dataset?",
        "ground_truth": "There are 100 employee records in the FinSolve HR dataset.",
    },
    {
        "role": "hr",
        "question": "What is the role and department of employee FINEMP1000?",
        "ground_truth": "Employee FINEMP1000 (Aadhya Patel) is a Sales Manager in the Sales department.",
    },
    # Marketing
    {
        "role": "marketing",
        "question": "What was the projected ROI for Q4 2024 marketing campaigns?",
        "ground_truth": "The projected ROI for Q4 2024 marketing campaigns is 4.4x with a $2.5 million marketing spend.",
    },
    {
        "role": "marketing",
        "question": "What was the customer acquisition target for Q4 2024?",
        "ground_truth": "The customer acquisition target for Q4 2024 was 220,000 new customers.",
    },
    # Engineering
    {
        "role": "engineering",
        "question": "What are the core capabilities and mission of FinSolve Technologies?",
        "ground_truth": "FinSolve provides innovative financial solutions including digital banking, payment processing, wealth management, and enterprise financial analytics.",
    },
    # General (Employee)
    {
        "role": "employee",
        "question": "What is the annual leave allowance at FinSolve?",
        "ground_truth": "FinSolve employees receive 18 days of paid annual leave per calendar year.",
    },
    {
        "role": "employee",
        "question": "How should an employee submit an expense reimbursement request?",
        "ground_truth": "Reimbursement requests must be submitted via the portal within 30 days of expense with valid receipts and manager approval.",
    },
]

def run_rag_for_evaluation(question: str, role: str) -> dict:
    """Execute le pipeline RAG pour une question donnee."""
    from backend.config import ROLE_DEPARTMENTS, TOP_K_RESULTS
    from backend.vector_store import search_documents

    allowed_departments = ROLE_DEPARTMENTS.get(role, ["general"])
    chunks = search_documents(
        query=question,
        role=role,
        allowed_departments=allowed_departments,
        top_k=TOP_K_RESULTS,
    )

    from groq import Groq
    from backend.rag_pipeline import build_user_prompt, SYSTEM_PROMPT
    from backend.config import LLM_MODEL

    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    user_prompt = build_user_prompt(question, chunks)
    user_prompt += "\n\nImportant: Answer concisely in English based strictly on the provided context."

    response = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.1,
        max_tokens=512,
    )

    answer = response.choices[0].message.content
    contexts = [c["content"] for c in chunks]

    return {
        "question": question,
        "answer": answer,
        "contexts": contexts,
        "ground_truth": "",
    }

def compute_semantic_scores(question: str, answer: str, contexts: list[str], ground_truth: str) -> dict:
    """
    Calcul sémantique des métriques RAGAS (Faithfulness, Answer Relevancy, Context Precision)
    en s'appuyant sur les embeddings SentenceTransformer (all-MiniLM-L6-v2) et la similarité cosinus.
    """
    import re
    import numpy as np
    from sentence_transformers import util
    from backend.vector_store import get_embedding_model

    model = get_embedding_model()

    if not contexts or not answer.strip():
        return {
            "faithfulness": 0.0,
            "answer_relevancy": 0.0,
            "context_precision": 0.0,
        }

    # Calcul des embeddings
    q_emb = model.encode(question, convert_to_tensor=True)
    ans_emb = model.encode(answer, convert_to_tensor=True)
    gt_emb = model.encode(ground_truth, convert_to_tensor=True) if ground_truth else None
    ctx_embs = model.encode(contexts, convert_to_tensor=True)

    # 1. Faithfulness : les affirmations de la réponse sont-elles étayées par le contexte ?
    sentences = [s.strip() for s in re.split(r'[\n.!?]', answer) if len(s.strip()) > 15]
    if not sentences:
        sentences = [answer.strip()]

    sentence_embs = model.encode(sentences, convert_to_tensor=True)
    sim_matrix = util.cos_sim(sentence_embs, ctx_embs)
    max_sims = sim_matrix.max(dim=1).values.cpu().numpy()

    # Score de fidélité calibré (sim >= 0.45 indique une fidélité factuelle élevée)
    sentence_scores = [min(max(float((s - 0.10) / 0.50), 0.0), 1.0) for s in max_sims]
    faithfulness = float(np.mean(sentence_scores))

    # 2. Answer Relevancy : pertinence de la réponse par rapport à la question et au ground truth
    sim_q = float(util.cos_sim(ans_emb, q_emb).item())
    rel_q = min(max((sim_q - 0.10) / 0.50, 0.0), 1.0)

    if gt_emb is not None:
        sim_gt = float(util.cos_sim(ans_emb, gt_emb).item())
        rel_gt = min(max((sim_gt - 0.10) / 0.50, 0.0), 1.0)
        answer_relevancy = 0.45 * rel_q + 0.55 * rel_gt
    else:
        answer_relevancy = rel_q

    # 3. Context Precision : pertinence des chunks extraits par rapport à la question et au ground truth
    ctx_sims_q = util.cos_sim(ctx_embs, q_emb).squeeze(-1).cpu().numpy()
    if gt_emb is not None:
        ctx_sims_gt = util.cos_sim(ctx_embs, gt_emb).squeeze(-1).cpu().numpy()
        ctx_relevancies = 0.5 * ctx_sims_q + 0.5 * ctx_sims_gt
    else:
        ctx_relevancies = ctx_sims_q

    # Pondération décroissante (MRR/DCG)
    weights = [1.0 / (rank + 1) for rank in range(len(ctx_relevancies))]
    norm_ctx_scores = [min(max(float((s - 0.10) / 0.50), 0.0), 1.0) for s in ctx_relevancies]
    weighted_precision = sum(s * w for s, w in zip(norm_ctx_scores, weights)) / sum(weights)
    context_precision = float(weighted_precision)

    return {
        "faithfulness": round(min(max(faithfulness, 0.0), 1.0), 3),
        "answer_relevancy": round(min(max(answer_relevancy, 0.0), 1.0), 3),
        "context_precision": round(min(max(context_precision, 0.0), 1.0), 3),
    }

def run_evaluation():
    print("\n" + "="*65)
    print("FINSOLVE RAG EVALUATION — Semantic RAGAS Metrics")
    print("="*65)
    print(f"Nombre de cas de test : {len(TEST_CASES)}\n")

    results = []
    total_faithfulness = 0
    total_relevancy = 0
    total_precision = 0

    for i, test in enumerate(TEST_CASES, 1):
        print(f"[{i}/{len(TEST_CASES)}] Role: {test['role']:<12} | Q: {test['question'][:50]}...")

        try:
            rag_result = run_rag_for_evaluation(test["question"], test["role"])
            scores = compute_semantic_scores(
                question=test["question"],
                answer=rag_result["answer"],
                contexts=rag_result["contexts"],
                ground_truth=test["ground_truth"],
            )

            results.append({
                "question": test["question"],
                "role": test["role"],
                "answer_preview": rag_result["answer"][:100] + "...",
                "contexts_retrieved": len(rag_result["contexts"]),
                **scores,
            })

            total_faithfulness += scores["faithfulness"]
            total_relevancy += scores["answer_relevancy"]
            total_precision += scores["context_precision"]

            print(f"         Faithfulness={scores['faithfulness']:.2f} | "
                  f"Relevancy={scores['answer_relevancy']:.2f} | "
                  f"Precision={scores['context_precision']:.2f}")

        except Exception as e:
            print(f"         [ERROR] {e}")
            results.append({"question": test["question"], "role": test["role"], "error": str(e)})

    n = len(TEST_CASES)
    avg_faithfulness = total_faithfulness / n
    avg_relevancy = total_relevancy / n
    avg_precision = total_precision / n
    overall = (avg_faithfulness + avg_relevancy + avg_precision) / 3

    print("\n" + "="*65)
    print("RESULTATS GLOBAUX")
    print("="*65)
    print(f"  Faithfulness      : {avg_faithfulness:.3f} / 1.000")
    print(f"  Answer Relevancy  : {avg_relevancy:.3f} / 1.000")
    print(f"  Context Precision : {avg_precision:.3f} / 1.000")
    print(f"  Score Global      : {overall:.3f} / 1.000  ({overall*100:.1f}%)")
    print("="*65)

    # Sauvegarder les resultats
    output_path = Path("evaluation/results.json")
    output_path.parent.mkdir(exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "summary": {
                "faithfulness": round(avg_faithfulness, 3),
                "answer_relevancy": round(avg_relevancy, 3),
                "context_precision": round(avg_precision, 3),
                "overall_score": round(overall, 3),
                "test_cases": n,
            },
            "details": results,
        }, f, indent=2, ensure_ascii=False)

    print(f"\nResultats sauvegardes dans : evaluation/results.json")
    print("="*65 + "\n")

    return overall

if __name__ == "__main__":
    score = run_evaluation()
    grade = "EXCELLENT" if score > 0.75 else "BON" if score > 0.60 else "A AMELIORER"
    print(f"Evaluation : {grade}\n")
