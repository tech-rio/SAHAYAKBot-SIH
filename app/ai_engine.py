"""
SAHAYAKBot AI Engine
Orchestrates LLM calls (NVIDIA NIM / Gemini) with RAG context injection.
"""
import requests
from typing import Optional, Tuple
from app.config import NVIDIA_API_KEY, NVIDIA_ENDPOINT, AI_MODEL, GEMINI_API_KEY, SYSTEM_PROMPT
from app.lang_detect import detect_language, get_lang_config
from app.rag_engine import retrieve_context, get_rag_context_text


def query_ai(user_query: str, lang: str = "hi") -> dict:
    """
    Main AI query orchestrator.
    Tries: NVIDIA NIM → Gemini → RAG fallback
    Returns dict with reply, detected_lang, source, matched_doc, search_method
    """
    # Auto-detect language from query text
    detected_lang = detect_language(user_query, fallback=lang)

    # Retrieve RAG context
    matched_doc, match_score, search_method = retrieve_context(user_query)
    rag_context = ""
    if matched_doc:
        print(f"[RAG Match] '{matched_doc['id']}' (score: {match_score}, method: {search_method})")
        rag_context = get_rag_context_text(matched_doc)

    # Try NVIDIA NIM first
    ai_reply = None
    source = "fallback"

    if NVIDIA_API_KEY and NVIDIA_API_KEY != "your-nvidia-api-key-here":
        ai_reply = _call_nvidia_nim(user_query, detected_lang, rag_context)
        if ai_reply:
            source = f"LLaMA-3.2 (NVIDIA NIM + RAG:{search_method})" if matched_doc else "LLaMA-3.2 (NVIDIA NIM)"

    # Fallback to Gemini if NIM fails
    if not ai_reply and GEMINI_API_KEY:
        ai_reply = _call_gemini(user_query, detected_lang, rag_context)
        if ai_reply:
            source = f"Gemini (RAG:{search_method})" if matched_doc else "Gemini AI"

    # If AI failed but RAG matched, use RAG directly
    if not ai_reply and matched_doc:
        if detected_lang == "en":
            ai_reply = matched_doc["answer_en"] + "\n\n(Note: AI generation failed, showing exact knowledge base match)"
        else:
            ai_reply = matched_doc["answer_hi"] + "\n\n(Note: AI generation failed, showing exact knowledge base match)"
        source = f"Ministry Knowledge Base (RAG:{search_method}, id:{matched_doc['id']})"
    elif not ai_reply:
        ai_reply = "AI systems are currently unavailable. Please try again later."
        source = "Error"

    return {
        "reply": ai_reply,
        "detected_lang": detected_lang,
        "source": source,
        "matched_doc": matched_doc,
        "search_method": search_method,
        "match_score": match_score
    }


def _call_nvidia_nim(query: str, lang: str, rag_context: str) -> Optional[str]:
    """Call NVIDIA NIM LLaMA 3.2 API."""
    lang_config = get_lang_config(lang)

    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": AI_MODEL,
        "messages": [
            {
                "role": "system",
                "content": f"{SYSTEM_PROMPT}\n{lang_config['instruction']}{rag_context}"
            },
            {
                "role": "user",
                "content": lang_config['prefix'].format(query=query)
            }
        ],
        "max_tokens": 400,
        "temperature": 0.2
    }

    try:
        resp = requests.post(NVIDIA_ENDPOINT, headers=headers, json=payload, timeout=120)
        if resp.status_code == 200:
            content = resp.json()["choices"][0]["message"]["content"]
            return content.strip()
        else:
            err_msg = f"[AI Error] NVIDIA NIM status {resp.status_code}: {resp.text[:200]}"
            print(err_msg)
            with open("scratch/ai_error.log", "a") as f: f.write(err_msg + "\n")
            return None
    except Exception as e:
        err_msg = f"[AI Error] NVIDIA NIM connection error: {e}"
        print(err_msg)
        with open("scratch/ai_error.log", "a") as f: f.write(err_msg + "\n")
        return None


def _call_gemini(query: str, lang: str, rag_context: str) -> Optional[str]:
    """Call Google Gemini API (free tier)."""
    lang_config = get_lang_config(lang)
    lang_name = {"hi": "HINDI", "mr": "MARATHI", "gu": "GUJARATI", "en": "ENGLISH"}.get(lang, "HINDI")

    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={GEMINI_API_KEY}"

    system_text = (
        f"{SYSTEM_PROMPT}\n\n"
        f"CRITICAL: Respond strictly in {lang_name}.\n"
        f"{lang_config['instruction']}"
        f"{rag_context}"
    )

    payload = {
        "contents": [{
            "role": "user",
            "parts": [{"text": f"{system_text}\n\nUser Question: {query}"}]
        }]
    }

    try:
        resp = requests.post(endpoint, json=payload, timeout=120, headers={"Content-Type": "application/json"})
        if resp.status_code == 200:
            data = resp.json()
            if data.get("candidates") and data["candidates"][0].get("content", {}).get("parts"):
                return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        else:
            err_msg = f"[AI Error] Gemini status {resp.status_code}: {resp.text[:200]}"
            print(err_msg)
            with open("scratch/ai_error.log", "a") as f: f.write(err_msg + "\n")
        return None
    except Exception as e:
        err_msg = f"[AI Error] Gemini connection error: {e}"
        print(err_msg)
        with open("scratch/ai_error.log", "a") as f: f.write(err_msg + "\n")
        return None
