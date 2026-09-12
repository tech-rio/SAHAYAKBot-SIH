import sys
import os
from pathlib import Path

# Add project root to python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.rag_engine import load_knowledge_base, init_semantic_search

if __name__ == "__main__":
    print("Building RAG Index...")
    has_kb = load_knowledge_base()
    if not has_kb:
        print("Failed to load Knowledge Base. Ensure data/knowledge_base.json exists.")
        sys.exit(1)
        
    has_chroma = init_semantic_search()
    if has_chroma:
        print("✅ RAG Index build successful!")
    else:
        print("❌ Failed to initialize ChromaDB. Make sure chromadb and sentence-transformers are installed.")
        sys.exit(1)
