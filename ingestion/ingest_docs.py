import sys
import os
import uuid
import pandas as pd
from pathlib import Path

# Fix encoding Windows
sys.stdout.reconfigure(encoding='utf-8')

# Ajouter le repertoire racine au path Python
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.config import DATA_PATH, DEPARTMENT_ROLES
from backend.vector_store import add_documents, get_collection_stats

# --- Configuration du chunking ---
CHUNK_SIZE = 800
CHUNK_OVERLAP = 150

# --- Chunking ---

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Decoupe un texte en chunks avec overlap."""
    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = start + chunk_size

        if end >= text_len:
            chunks.append(text[start:].strip())
            break

        # Chercher un saut de ligne propre
        newline_pos = text.rfind('\n', start, end)
        if newline_pos > start + chunk_size // 2:
            end = newline_pos

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        start = end - overlap

    return [c for c in chunks if len(c) > 50]

# --- Loaders ---

def load_markdown_file(filepath: Path) -> str:
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()

def load_csv_file(filepath: Path) -> str:
    """Charge un CSV et le convertit en texte structure."""
    df = pd.read_csv(filepath)

    summary = f"Dataset: {filepath.name}\n"
    summary += f"Colonnes: {', '.join(df.columns.tolist())}\n"
    summary += f"Nombre d'enregistrements: {len(df)}\n\n"

    numeric_cols = df.select_dtypes(include=['number']).columns
    if len(numeric_cols) > 0:
        summary += "Statistiques:\n"
        for col in numeric_cols[:10]:
            summary += f"  {col}: min={df[col].min():.2f}, max={df[col].max():.2f}, mean={df[col].mean():.2f}\n"
        summary += "\n"

    records = []
    for _, row in df.iterrows():
        record_parts = [f"{col}: {val}" for col, val in row.items() if pd.notna(val)]
        records.append(" | ".join(record_parts))

    return summary + "\n".join(records)

# --- Ingestion par departement ---

def ingest_department(dept_folder: Path, department: str) -> int:
    """Ingere tous les fichiers d'un departement dans Qdrant."""
    all_chunks = []
    all_metadatas = []
    all_ids = []

    files = list(dept_folder.glob("*.md")) + list(dept_folder.glob("*.csv"))

    if not files:
        print(f"  [WARN] Aucun fichier dans {dept_folder}")
        return 0

    for filepath in files:
        print(f"  [FILE] {filepath.name}")

        if filepath.suffix == ".md":
            text = load_markdown_file(filepath)
        elif filepath.suffix == ".csv":
            text = load_csv_file(filepath)
        else:
            continue

        if not text.strip():
            print(f"         [SKIP] Fichier vide")
            continue

        chunks = chunk_text(text)
        print(f"         [OK] {len(chunks)} chunks")

        for i, chunk in enumerate(chunks):
            chunk_id = f"{department}_{filepath.stem}_{i}_{uuid.uuid4().hex[:8]}"
            metadata = {
                "source": filepath.name,
                "department": department,
                "chunk_index": i,
                "total_chunks": len(chunks),
                "file_type": filepath.suffix.lstrip("."),
                "allowed_roles": ",".join(DEPARTMENT_ROLES.get(department, [])),
            }
            all_chunks.append(chunk)
            all_metadatas.append(metadata)
            all_ids.append(chunk_id)

    if all_chunks:
        add_documents(all_chunks, all_metadatas, all_ids)

    return len(all_chunks)

# --- Point d'entree ---

def run_ingestion():
    data_path = Path(DATA_PATH)

    if not data_path.exists():
        print(f"[ERROR] Repertoire introuvable: {data_path.absolute()}")
        sys.exit(1)

    print("\n" + "="*60)
    print("FinSolve -- Ingestion des Documents dans Qdrant")
    print("="*60)

    total_chunks = 0
    departments = ["finance", "hr", "marketing", "engineering", "general"]

    for dept in departments:
        dept_folder = data_path / dept
        if not dept_folder.exists():
            print(f"\n[WARN] Dossier manquant: {dept_folder}")
            continue

        print(f"\n[DEPT] {dept.upper()}")
        count = ingest_department(dept_folder, dept)
        total_chunks += count
        print(f"       -> {count} chunks indexes")

    stats = get_collection_stats()
    print("\n" + "="*60)
    print("Ingestion terminee !")
    print(f"  Total chunks indexes cette session : {total_chunks}")
    print(f"  Total dans Qdrant                  : {stats['total_chunks']}")
    print("="*60 + "\n")

if __name__ == "__main__":
    run_ingestion()
