import re
from dataclasses import dataclass
from typing import Optional

FINSOLVE_TOPICS = [
    "budget", "revenu", "dépense", "rapport", "financier", "bénéfice",
    "trésorerie", "marge", "coût", "remboursement", "facture",
    "revenue", "income", "expense", "financial", "profit", "cash", "margin",
    "reimbursement", "invoice", "salary", "payroll", "paie", "salaire",
    "campagne", "marketing", "client", "vente", "conversion", "ROI",
    "campaign", "customer", "sale", "acquisition", "retention",
    "employé", "employee", "recrutement", "performance", "congé", "présence",
    "attendance", "leave", "hiring", "turnover", "formation", "training",
    "architecture", "microservice", "CI/CD", "pipeline", "sécurité",
    "déploiement", "API", "infrastructure", "monitoring", "DevOps",
    "security", "deployment", "database", "système", "system",
    "politique", "policy", "FAQ", "événement", "event", "règlement",
    "procédure", "procedure", "contrat", "contract", "onboarding",
    "FinSolve", "entreprise", "company", "département", "department",
    "stratégie", "strategy", "Q1", "Q2", "Q3", "Q4", "2024", "2025",
]

INJECTION_PATTERNS = [
    r"ignore\s+(tes|your|all|toutes?)\s+instructions",
    r"(oublie|forget|ignore)\s+(tout|everything|all)",
    r"act\s+as\s+a?\s+different",
    r"pretend\s+(you|to\s+be)",
    r"jailbreak",
    r"DAN\s+mode",
    r"system\s+prompt",
    r"prompt\s+injection",
    r"reveal\s+(your|the|all)\s+(instructions|prompt|system)",
    r"montre[\-\s]moi\s+(tes|les)\s+instructions",
]


@dataclass
class GuardrailResult:
    is_safe: bool
    reason: Optional[str] = None
    suggestion: Optional[str] = None


def check_empty_query(query: str) -> GuardrailResult:
    if not query or len(query.strip()) < 3:
        return GuardrailResult(
            is_safe=False,
            reason="Query is empty or too short.",
            suggestion="Please enter a question regarding FinSolve enterprise data.",
        )
    return GuardrailResult(is_safe=True)


def check_prompt_injection(query: str) -> GuardrailResult:
    query_lower = query.lower()
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, query_lower, re.IGNORECASE):
            return GuardrailResult(
                is_safe=False,
                reason="Prompt injection or jailbreak attempt detected.",
                suggestion="FinSolve Assistant only answers legitimate queries related to company operations.",
            )
    return GuardrailResult(is_safe=True)


def check_topic_relevance(query: str) -> GuardrailResult:
    query_lower = query.lower()

    for topic in FINSOLVE_TOPICS:
        if topic.lower() in query_lower:
            return GuardrailResult(is_safe=True)

    if len(query.split()) <= 6:
        return GuardrailResult(is_safe=True)

    return GuardrailResult(
        is_safe=False,
        reason="Query falls outside the scope of FinSolve enterprise domains.",
        suggestion=(
            "FinSolve Assistant specializes in internal company data: Finance, Marketing, "
            "Human Resources, Engineering, and Company Policies."
        ),
    )


def check_query_length(query: str) -> GuardrailResult:
    if len(query) > 2000:
        return GuardrailResult(
            is_safe=False,
            reason="Query exceeds the maximum allowable length.",
            suggestion="Please limit your query to 2000 characters or less.",
        )
    return GuardrailResult(is_safe=True)


def validate_query(query: str) -> GuardrailResult:
    checks = [
        check_empty_query,
        check_query_length,
        check_prompt_injection,
        check_topic_relevance,
    ]
    for check in checks:
        result = check(query)
        if not result.is_safe:
            return result
    return GuardrailResult(is_safe=True)
