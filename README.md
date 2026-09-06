# 🌾 SAHAYAKBot (सहायक बॉट)
### Omnichannel Multilingual AI Legal Intelligence & Cooperative Governance Platform
**Smart India Hackathon (SIH 2026) | Problem Statement ID: SIH26088 (Software Edition)**  
**Ministry:** Ministry of Cooperation, Government of India  
**Theme:** Agriculture, FoodTech & Rural Development  

---

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![AI Model](https://img.shields.io/badge/LLM-Meta%20LLaMA--3.2%2011B-green.svg)](https://build.nvidia.com/)
[![Database](https://img.shields.io/badge/Database-SQLite3%20Persistent-orange.svg)](https://www.sqlite.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20Resilient-purple.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![DPDP Act Compliant](https://img.shields.io/badge/Security-DPDP%20Act%202023-emerald.svg)](https://www.meity.gov.in/)

---

## 🎯 Live Working Deployment
* 📱 **Citizen Voice Portal (Mobile & Web):** [Launch Citizen Portal](https://reporters-programs-developer-creator.trycloudflare.com/index.html)
* 📊 **National Ministry Telemetry & Grievance Dashboard:** [Launch Ministry Admin Portal](https://reporters-programs-developer-creator.trycloudflare.com/admin.html)

---

## 📖 Problem Statement & Ground Realities
India powers over **63,000+ Primary Agricultural Credit Societies (PACS)** and 8.5+ lakh registered cooperatives serving more than **13 Crore rural citizens**. Despite extensive computerization under the ₹2,516 Crore Centrally Sponsored Scheme, small and marginal farmers face:
1. **Dense Legal Jargon:** The *Model Bye-Laws for PACS 2023* and *Multi-State Co-operative Societies (MSCS) Act 2023* are 100+ page formal legal texts incomprehensible to ordinary farmers.
2. **Critical Missed Deadlines:** Strict time limits such as the **72-hour crop loss reporting window under PMFBY** or annual KCC renewal windows go unnoticed.
3. **Language & Literacy Barriers:** Existing web portals require complex typing in English or formal script.
4. **Lack of Ministry Visibility:** District-level dispute hotspots and grievance escalations remain invisible to central policymakers.

---

## 💡 Solution: SAHAYAKBot (सहायक बॉट)
**SAHAYAKBot** is a voice-first, legally grounded, omnichannel software platform delivering instant legal assistance, subvention calculation, and automated grievance redressal across rural India.

### 🌟 Core Capabilities
* 🎙️ **Voice-First Indic Interaction:** Zero typing required. Speaks and listens in **Hindi, Marathi, Gujarati, and English** with regional accent tolerance.
* 📜 **Zero-Hallucination Legal RAG:** Every response cites official statutory references (*Model Bye-Laws 2023 Clause 7, MSCS Act 2023 Section 84, PMFBY Clause 14.2, RBI KCC IS-PRI Circular*).
* 🧮 **Interactive KCC 4% Subvention Calculator:** Computes net 4% effective interest (7% base - 3% prompt repayment incentive) and annual savings for farmers.
* 📱 **True Omnichannel Delivery:**
  * **Mobile PWA:** Installable on smartphones with full offline Service Worker caching.
  * **CSC / PACS Web Desk:** High-speed desktop interface for Village Level Entrepreneurs (VLEs).
  * **Panchayat Touch Kiosk Mode:** High-contrast touch layout for Common Service Centers.
  * **WhatsApp Advice Integration:** 1-tap dispatch of verifiable legal advice slips.
* 💾 **Permanent SQLite Audit Trail (`sahakar_mitra.db`):** Real-time grievance tracking with officer escalation workflows (*Escalate to ARCS / Mark Resolved*).
* 📊 **Ministry Live Telemetry Sync:** Inquiries from citizen terminals instantly update national heatmaps and live query counters on the Ministry portal.

---

## 🏛️ System Architecture

```
                          [ CITIZEN TOUCHPOINTS ]
      Mobile PWA (Android/iOS) │ CSC Web Portal │ Panchayat Touch Kiosk
                                    │
                                    ▼
                          [ FRONTEND LAYER ]
          HTML5 / Modern CSS Grid / Web Speech API (Indic STT)
          + Offline Service Worker (sw.js) & Web Manifest (manifest.json)
                                    │
                                    ▼
       [ HIGH-PERFORMANCE BACKEND (Python 3.12 / ThreadingHTTPServer) ]
     ├── /api/chat           -> LLaMA 3.2 AI Orchestrator & Fallback
     ├── /api/tts            -> Indic High-Fidelity Audio Streaming Proxy
     ├── /api/telemetry      -> Live Ministry Event Bus & Analytics
     ├── /api/grievances     -> SQLite Persistent Audit Trail & Action Engine
     └── /api/kcc-calculate  -> 4% Net Interest & Subvention Formula Engine
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
[ PRIMARY AI ENGINE ]                                [ PERSISTENT STORAGE ]
Meta LLaMA 3.2 11B Model                             SQLite Database (sahakar_mitra.db)
(NVIDIA NIM Accelerated)                             • Permanent Grievances Table
Statutory Clause Citations                           • Telemetry Audit Log Table
                                                     • Offline Legal Knowledge Base
                                    │
                                    ▼
                   [ MINISTRY GOVERNANCE & TELEMETRY ]
       Real-Time District Dispute Heatmaps, Audit Logs & Automated Insights
```

---

## 🛠️ Technology Stack
* **Frontend:** Responsive HTML5, Vanilla CSS, Progressive Web App (PWA), Web Speech API.
* **Backend Microservices:** Python 3.12, `http.server.ThreadingHTTPServer`, RESTful JSON API.
* **Database:** SQLite3 (`sahakar_mitra.db`) with thread-safe transactional logging.
* **AI & Language Models:** Meta LLaMA 3.2 11B Vision Instruct via NVIDIA NIM API; local semantic RAG fallback.
* **Audio & Speech:** Multi-dialect Indic Text-to-Speech streaming proxy with phonetic word normalization.
* **Security & Compliance:** Digital Personal Data Protection (DPDP) Act 2023 compliance with ephemeral biometric tokenization.

---

## 🚀 Local Installation & Setup

### Prerequisites
* Python 3.10+
* Requests library (`pip install requests`)

### 1. Clone Repository & Navigate
```bash
git clone https://github.com/your-team/sahakar-mitra.git
cd sahakar-mitra
```

### 2. Configure NVIDIA API Key (Optional for Live Cloud LLM)
Set your NVIDIA API key in environment or `.env`:
```bash
set NVIDIA_API_KEY=nvapi-your-key-here
```
*(If omitted, the platform automatically switches to the built-in local cooperative legal RAG engine with zero downtime).*

### 3. Launch Server
```bash
python server.py
```
Visit:
* **Citizen Portal:** `http://127.0.0.1:8000/index.html`
* **Ministry Admin Portal:** `http://127.0.0.1:8000/admin.html`

---

## ⚖️ Statutory References Grounded in AI
1. *Model Bye-Laws for Primary Agricultural Credit Societies (PACS) 2023*, Ministry of Cooperation, GoI.
2. *Multi-State Co-operative Societies (Amendment) Act 2023*, Gazette of India.
3. *Pradhan Mantri Fasal Bima Yojana (PMFBY) Operational Guidelines 2020 (Clause 14.2)*.
4. *RBI Master Circular - Kisan Credit Card (KCC) Scheme & Interest Subvention Scheme (IS-PRI)*.
5. *Digital Personal Data Protection (DPDP) Act 2023*, Ministry of Electronics & IT (MeitY).

---

## 👥 Team Details
* **Problem Statement ID:** SIH26088 (Software Track)
* **Theme:** Agriculture, FoodTech & Rural Development
* **Institution:** [Your College / Institute Name]
