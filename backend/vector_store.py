from pathlib import Path
from typing import Optional
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, PointStruct,
    Filter, FieldCondition, MatchValue, MatchAny,
)
from sentence_transformers import SentenceTransformer

from backend.config import (
    CHROMA_DB_PATH,
    CHROMA_COLLECTION_NAME,
    EMBEDDING_MODEL,
    TOP_K_RESULTS,
)

VECTOR_SIZE = 384
QDRANT_PATH = CHROMA_DB_PATH

_embedding_model: Optional[SentenceTransformer] = None
_qdrant_client: Optional[QdrantClient] = None


def get_embedding_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = SentenceTransformer(EMBEDDING_MODEL)
    return _embedding_model


def get_qdrant_client() -> QdrantClient:
    global _qdrant_client
    if _qdrant_client is None:
        Path(QDRANT_PATH).mkdir(parents=True, exist_ok=True)
        _qdrant_client = QdrantClient(path=QDRANT_PATH)
        _ensure_collection(_qdrant_client)
    return _qdrant_client


def _ensure_collection(client: QdrantClient) -> None:
    existing = [c.name for c in client.get_collections().collections]
    if CHROMA_COLLECTION_NAME not in existing:
        client.create_collection(
            collection_name=CHROMA_COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )


def embed_texts(texts: list[str]) -> list[list[float]]:
    model = get_embedding_model()
    return model.encode(texts, show_progress_bar=False).tolist()


def add_documents(
    chunks: list[str],
    metadatas: list[dict],
    ids: list[str],
) -> None:
    client = get_qdrant_client()
    embeddings = embed_texts(chunks)

    points = [
        PointStruct(
            id=abs(hash(id_str)) % (2**63),
            vector=emb,
            payload={**meta, "content": chunk},
        )
        for chunk, emb, meta, id_str in zip(chunks, embeddings, metadatas, ids)
    ]

    batch_size = 100
    for i in range(0, len(points), batch_size):
        client.upsert(
            collection_name=CHROMA_COLLECTION_NAME,
            points=points[i:i + batch_size],
        )


def search_documents(
    query: str,
    role: str,
    allowed_departments: list[str],
    top_k: int = TOP_K_RESULTS,
) -> list[dict]:
    client = get_qdrant_client()
    query_vector = embed_texts([query])[0]

    if len(allowed_departments) == 1:
        dept_filter = Filter(
            must=[FieldCondition(
                key="department",
                match=MatchValue(value=allowed_departments[0]),
            )]
        )
    else:
        dept_filter = Filter(
            must=[FieldCondition(
                key="department",
                match=MatchAny(any=allowed_departments),
            )]
        )

    results = client.search(
        collection_name=CHROMA_COLLECTION_NAME,
        query_vector=query_vector,
        query_filter=dept_filter,
        limit=top_k,
        with_payload=True,
    )

    output = []
    for hit in results:
        payload = hit.payload or {}
        output.append({
            "content": payload.get("content", ""),
            "source": payload.get("source", "unknown"),
            "department": payload.get("department", ""),
            "page": payload.get("chunk_index", ""),
            "relevance_score": round(hit.score, 4),
        })

    return output


def get_collection_stats() -> dict:
    client = get_qdrant_client()
    info = client.get_collection(CHROMA_COLLECTION_NAME)
    return {
        "total_chunks": info.points_count,
        "vector_size": VECTOR_SIZE,
        "collection": CHROMA_COLLECTION_NAME,
        "model": EMBEDDING_MODEL,
    }
