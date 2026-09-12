"""
SAHAYAKBot TTS Service
High-quality text-to-speech using Edge-TTS (free Microsoft neural voices)
with fallback to gTTS / Google Translate proxy.
"""
import asyncio
import hashlib
import os
from pathlib import Path
from app.config import TTS_CACHE_DIR

# Voice mapping for Indian languages (Edge-TTS neural voices)
EDGE_TTS_VOICES = {
    "hi": "hi-IN-SwaraNeural",       # Female Hindi (high quality)
    "mr": "mr-IN-AarohiNeural",      # Female Marathi
    "gu": "gu-IN-DhwaniNeural",      # Female Gujarati
    "en": "en-IN-NeerjaNeural",      # Female Indian English
}

_edge_tts_available = False

try:
    import edge_tts
    _edge_tts_available = True
    print("[TTS Engine] ✅ Edge-TTS loaded (Microsoft neural voices)")
except ImportError:
    print("[TTS Engine] edge-tts not installed. Using fallback TTS.")
    print("[TTS Engine] Install with: pip install edge-tts")


async def _generate_edge_tts(text: str, lang: str, output_path: str) -> bool:
    """Generate TTS audio using Edge-TTS (async)."""
    voice = EDGE_TTS_VOICES.get(lang, EDGE_TTS_VOICES["hi"])
    try:
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output_path)
        return True
    except Exception as e:
        print(f"[TTS Error] Edge-TTS failed: {e}")
        return False


from typing import Optional

def generate_tts_audio(text: str, lang: str = "hi") -> Optional[bytes]:
    """
    Generate TTS audio for the given text and language.
    Returns MP3 bytes or None on failure.
    Uses caching to avoid regenerating identical text.
    """
    if not text or not text.strip():
        return None

    # Limit text length for TTS
    safe_text = text[:500]

    # Check cache first
    text_hash = hashlib.md5(f"{lang}:{safe_text}".encode()).hexdigest()
    cache_path = TTS_CACHE_DIR / f"{text_hash}.mp3"

    if cache_path.exists():
        return cache_path.read_bytes()

    # Try Edge-TTS first (best quality)
    if _edge_tts_available:
        try:
            loop = asyncio.new_event_loop()
            success = loop.run_until_complete(_generate_edge_tts(safe_text, lang, str(cache_path)))
            loop.close()

            if success and cache_path.exists():
                return cache_path.read_bytes()
        except Exception as e:
            print(f"[TTS Error] Edge-TTS async error: {e}")

    # Fallback: gTTS
    try:
        from gtts import gTTS
        tts = gTTS(text=safe_text, lang=lang, slow=False)
        tts.save(str(cache_path))
        return cache_path.read_bytes()
    except ImportError:
        pass
    except Exception as e:
        print(f"[TTS Error] gTTS failed: {e}")

    # Last resort fallback: Google Translate TTS proxy
    try:
        import requests
        import urllib.parse
        tts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl={lang}&q={urllib.parse.quote(safe_text[:200])}"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        r = requests.get(tts_url, headers=headers, timeout=8)
        if r.status_code == 200:
            # Cache the result
            cache_path.write_bytes(r.content)
            return r.content
    except Exception as e:
        print(f"[TTS Error] Fallback proxy failed: {e}")

    return None


def clear_tts_cache():
    """Clear all cached TTS audio files."""
    count = 0
    for f in TTS_CACHE_DIR.glob("*.mp3"):
        f.unlink()
        count += 1
    return count
