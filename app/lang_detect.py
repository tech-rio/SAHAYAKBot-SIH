"""
SAHAYAKBot Language Detection Module
Detects Hindi, Marathi, Gujarati, and English from user text.
"""
import re


def detect_language(text: str, fallback: str = "hi") -> str:
    """
    Detect the language of the input text.
    Returns: 'hi', 'mr', 'gu', or 'en'
    """
    if not text or not text.strip():
        return fallback

    # 1. Gujarati Unicode block (U+0A80 to U+0AFF)
    if re.search(r'[\u0A80-\u0AFF]', text):
        return "gu"

    # 2. English / Latin alphabet dominance
    latin_chars = len(re.findall(r'[a-zA-Z]', text))
    devanagari_chars = len(re.findall(r'[\u0900-\u097F]', text))

    if latin_chars > 5 and latin_chars > devanagari_chars:
        return "en"

    # 3. Marathi vs Hindi in Devanagari
    if devanagari_chars > 0:
        marathi_markers = [
            'आहे', 'आहेत', 'नाही', 'नाहीत', 'कसे', 'काय', 'करायचे', 'करायचा', 'करावे',
            'सांगा', 'मिळेल', 'मिळतात', 'मिळणार', 'पाहिजे', 'पाहिजेत', 'होय', 'शेतकरी',
            'पिक', 'कर्ज', 'अर्ज', 'माहिती', 'पॅक्स', 'मदत', 'द्या', 'सांग', 'कोणते',
            'कोणती', 'कधी', 'कसं', 'कुठे', 'झाले', 'झाली', 'दिले', 'केले', 'सभासद',
            'सभासदत्व', 'गावातील', 'माझे', 'माझ्या', 'आमच्या', 'घ्यायचे', 'हवे', 'लागतील',
            'करावी', 'पावती', 'तक्रार', 'विचारा', 'बोला'
        ]
        hindi_markers = [
            'है', 'हैं', 'होगा', 'होगी', 'कैसे', 'क्या', 'क्यों', 'कहाँ', 'बताओ',
            'बताइए', 'मिलेगा', 'मिलेगी', 'चाहिए', 'करना', 'करूँ', 'सकते', 'सकता',
            'हूँ', 'मुझे', 'मेरा', 'मेरी', 'हमारे', 'नियम', 'दीजिए', 'बोलिए'
        ]

        words = text.split()
        m_score = sum(1 for w in words if any(m in w for m in marathi_markers))
        h_score = sum(1 for w in words if any(h in w for h in hindi_markers))

        if m_score > h_score and m_score > 0:
            return "mr"
        elif h_score > m_score and h_score > 0:
            return "hi"

    return fallback


LANG_INSTRUCTIONS = {
    "mr": {
        "instruction": "MANDATORY: You must respond in pure Marathi (मराठी देवनागरी लिपी). Use polite and official tone. Provide 3-4 bullet points and statutory reference.",
        "prefix": "प्रश्न: {query}\n(कृपया उत्तर फक्त मराठी देवनागरी मध्ये ३-४ मुद्द्यांत द्या):"
    },
    "gu": {
        "instruction": "MANDATORY: You must respond in pure Gujarati (ગુજરાતી લિપિ). Use polite and official tone. Provide 3-4 bullet points and statutory reference.",
        "prefix": "પ્રશ્ન: {query}\n(કૃપા કરીને ફક્ત ગુજરાતી લિપિમાં ૩-૪ મુદ્દામાં જવાબ આપો):"
    },
    "en": {
        "instruction": "MANDATORY: Answer in clear English. Use polite tone, 3-4 bullet points, and official legal citation.",
        "prefix": "Question: {query}\n(Please answer in 3-4 clear bullet points with official statutory reference):"
    },
    "hi": {
        "instruction": "MANDATORY: You must respond in 100% pure Devanagari Hindi (देवनागरी हिन्दी). Absolutely NO Latin/English characters.",
        "prefix": "प्रश्न: {query}\n(कृपया उत्तर केवल शुद्ध देवनागरी हिन्दी में 3-4 बिन्दुओं में और वैधानिक संदर्भ के साथ दें):"
    }
}


def get_lang_config(lang: str) -> dict:
    """Get language-specific instruction and prefix for AI prompt."""
    return LANG_INSTRUCTIONS.get(lang, LANG_INSTRUCTIONS["hi"])
