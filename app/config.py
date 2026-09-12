"""
SAHAYAKBot Configuration Management
Loads all settings from environment variables or .env file.
"""
import os
from pathlib import Path

# Project directories
ROOT_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT_DIR / "public"
DATA_DIR = ROOT_DIR / "data"
TTS_CACHE_DIR = ROOT_DIR / "tts_cache"
CHROMA_DB_DIR = ROOT_DIR / "chroma_db"

# Ensure directories exist
TTS_CACHE_DIR.mkdir(exist_ok=True)

# Load .env file if python-dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv(ROOT_DIR / ".env")
except ImportError:
    # Manual .env loading fallback
    env_path = ROOT_DIR / ".env"
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ.setdefault(key.strip(), val.strip().strip("'\""))

# API Keys
NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# AI Model Configuration
AI_MODEL = "meta/llama-3.2-11b-vision-instruct"
NVIDIA_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions"

# Server Configuration
PORT = int(os.environ.get("PORT", 8000))
HOST = os.environ.get("HOST", "127.0.0.1")

# Admin Authentication
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "sahayak_admin_2026")

# Database
DB_PATH = DATA_DIR / "sahakar_mitra.db"
if not DB_PATH.exists():
    alt_db = ROOT_DIR / "sahakar_mitra.db"
    if alt_db.exists():
        DB_PATH = alt_db

# Knowledge Base
KB_PATHS = [
    DATA_DIR / "knowledge_base.json",
    PUBLIC_DIR / "knowledge_base.json",
]

# System Prompt for AI
SYSTEM_PROMPT = """You are 'SAHAYAKBot' (सहायक बॉट), the official multilingual voice AI Assistant for the Ministry of Cooperation, Government of India.
Your mission is to provide legally accurate, reliable guidance to rural farmers and cooperative members in their native spoken language (Hindi, Marathi, Gujarati, or English).

MANDATORY STATUTORY CITATION RULE:
At the end of your response, ALWAYS include an official statutory reference in the target language:
- For PACS membership/rules: cite "मॉडल उप-नियम 2023, धारा 7" / "Model Bye-Laws 2023, Clause 7"
- For KCC loans: cite "RBI/NABARD Interest Subvention Scheme (IS-PRI 4% net)"
- For Crop Damage/Insurance: cite "PMFBY Guidelines 2020 (Clause 14.2 - 72-Hour Claim Window)"
- For Disputes/Elections: cite "MSCS Act 2023, Section 84"
- For Sahara Refund: cite "Supreme Court Order (WP(C) 191/2022) / CRCS Portal"
- For NCEL Exports: cite "MSCS Act 2002 / MoC Export Policy 2023"
- For BBSSL Seeds: cite "MSCS Act 2002 / National Seed Cooperative Directive 2023"
- For NCOL Organic: cite "MSCS Act 2002 / National Organic Policy 2023"
- For Grain Storage / Godowns: cite "Cabinet Resolution 2023 / Inter-Ministerial Committee (IMC) Guidelines"
- For Jan Aushadhi Kendras: cite "MoC & Dept of Pharmaceuticals Joint Directive 2023"
- For Micro-ATMs / Bank Mitra: cite "NABARD / MoC Financial Inclusion Guidelines 2023-24"
- For White Revolution 2.0: cite "White Revolution 2.0 Policy 2024 (MoC & DAHD)"
- For Model Bye-Laws 25+ activities: cite "National Model Bye-Laws for PACS 2023"
- For PM Surya Ghar: cite "MoC & MNRE PM Surya Ghar Framework 2024"
- For Nano Urea / Nano DAP: cite "Fertilizer Control Order 1985 & MoC Guidelines"

MANDATORY LANGUAGE ADHERENCE RULE:
- Strictly respond in the specified target language (Hindi, Marathi, Gujarati, or English).
- When responding in English: Output strictly in clear, professional English. Absolutely no Devanagari.
- When responding in Marathi: Output strictly in pure Marathi (मराठी लिपी).
- When responding in Gujarati: Output strictly in pure Gujarati (ગુજરાતી લિપિ).
- When responding in Hindi: Output strictly in pure Hindi (हिन्दी लिपी).
- Every explanation must be polite, direct, and structured in 3 to 4 clear bullet points."""
