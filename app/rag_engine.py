"""
SAHAYAKBot RAG Engine
Semantic search over the cooperative legal knowledge base.
Supports both ChromaDB (if available) and keyword fallback.
"""
import json
import os
from typing import Optional, Tuple
from app.config import KB_PATHS

# Knowledge Base storage
RAG_KB = []


def load_knowledge_base():
    """Load the FAQ knowledge base from JSON files."""
    global RAG_KB
    for candidate in KB_PATHS:
        if os.path.exists(str(candidate)):
            try:
                with open(str(candidate), 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    RAG_KB = data.get('faq', [])
                    print(f"[RAG Engine] Loaded {len(RAG_KB)} verified records from {candidate}")
                    return True
            except Exception as e:
                print(f"[RAG Engine] Error reading {candidate}: {e}")
    print("[RAG Engine] WARNING: No knowledge base file found!")
    return False


# Try to use ChromaDB for semantic search
_chroma_collection = None
_use_semantic = False

def init_semantic_search():
    """Initialize ChromaDB vector store for semantic retrieval."""
    global _chroma_collection, _use_semantic
    try:
        import chromadb
        from chromadb.utils import embedding_functions

        client = chromadb.PersistentClient(path=str(os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db")))

        # Use multilingual model for Hindi/Marathi/Gujarati/English
        ef = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )

        _chroma_collection = client.get_or_create_collection(
            name="sahayakbot_kb",
            embedding_function=ef,
            metadata={"hnsw:space": "cosine"}
        )

        # Index knowledge base if collection is empty
        if _chroma_collection.count() == 0 and RAG_KB:
            print("[RAG Engine] Indexing knowledge base into ChromaDB...")
            documents = []
            metadatas = []
            ids = []

            for item in RAG_KB:
                # Create a rich search document combining all searchable text
                doc_text = (
                    f"{item.get('question_hi', '')} {item.get('question_en', '')} "
                    f"{' '.join(item.get('keywords', []))} "
                    f"{item.get('answer_en', '')[:200]}"
                )
                documents.append(doc_text)
                metadatas.append({
                    "id": item.get("id", ""),
                    "category": item.get("category", ""),
                    "question_hi": item.get("question_hi", ""),
                    "question_en": item.get("question_en", "")
                })
                ids.append(item.get("id", f"doc_{len(ids)}"))

            _chroma_collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            print(f"[RAG Engine] ✅ Indexed {len(documents)} documents into ChromaDB")

        _use_semantic = True
        print(f"[RAG Engine] ✅ Semantic search active (ChromaDB + multilingual embeddings)")
        return True

    except ImportError:
        print("[RAG Engine] ChromaDB not installed. Using keyword fallback.")
        print("[RAG Engine] Install with: pip install chromadb sentence-transformers")
        return False
    except Exception as e:
        print(f"[RAG Engine] ChromaDB init error: {e}. Using keyword fallback.")
        return False


def retrieve_context(query: str) -> Tuple[Optional[dict], float, str]:
    """
    Retrieve the most relevant knowledge base document for a query.
    Returns: (matched_doc, confidence_score, search_method)
    """
    if not RAG_KB or not query:
        return None, 0.0, "none"

    # Try semantic search first
    if _use_semantic and _chroma_collection:
        try:
            results = _chroma_collection.query(
                query_texts=[query],
                n_results=1
            )
            if results and results['ids'] and results['ids'][0]:
                doc_id = results['ids'][0][0]
                distance = results['distances'][0][0] if results.get('distances') else 1.0
                similarity = 1 - distance  # cosine distance to similarity

                if similarity > 0.3:  # threshold for relevance
                    matched_doc = next((item for item in RAG_KB if item.get('id') == doc_id), None)
                    if matched_doc:
                        return matched_doc, round(similarity * 100, 1), "semantic"
        except Exception as e:
            print(f"[RAG Engine] Semantic search error: {e}")

    # Fallback: Enhanced keyword matching
    return _keyword_search(query)


def _keyword_search(query: str) -> Tuple[Optional[dict], float, str]:
    """Keyword-based search fallback."""
    q_lower = query.lower().strip()
    best_doc = None
    best_score = 0

    for item in RAG_KB:
        score = 0

        # Keyword match
        for kw in item.get('keywords', []):
            if kw.lower() in q_lower:
                score += 3

        # Question match (exact substring)
        q_hi = item.get('question_hi', '').lower()
        q_en = item.get('question_en', '').lower()
        if q_hi in q_lower or q_en in q_lower:
            score += 6
        if q_lower in q_hi or q_lower in q_en:
            score += 4

        # ID match
        item_id = item.get('id', '').lower().replace('_', ' ')
        if item_id in q_lower:
            score += 4

        if score > best_score:
            best_score = score
            best_doc = item

    if best_doc and best_score >= 3:
        return best_doc, float(best_score), "keyword"
    return None, 0.0, "keyword"


def get_rag_context_text(matched_doc: dict) -> str:
    """Format a matched document as RAG context for the AI prompt."""
    return (
        f"\n\n--- OFFICIAL VERIFIED MINISTRY RAG KNOWLEDGE BASE ---\n"
        f"Topic: {matched_doc['question_en']} / {matched_doc['question_hi']}\n"
        f"Key Provisions (English):\n{matched_doc['answer_en']}\n"
        f"Key Provisions (Hindi):\n{matched_doc['answer_hi']}\n"
        f"INSTRUCTION: If this official scheme context directly answers the user's question, use it as your primary source. "
        f"However, if the user is asking a general farming question (e.g., about crops, soil, or general agricultural advice) that is NOT fully answered by this scheme, use your expert agricultural knowledge to directly answer their specific question accurately, and optionally mention this scheme if it is relevant.\n"
        f"----------------------------------------------------------"
    )
