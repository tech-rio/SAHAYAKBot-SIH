# -*- coding: utf-8 -*-
import sys
import requests
import json

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_URL = "http://127.0.0.1:8000"

def test_queries():
    test_cases = [
        {"q": "NCEL kya hai aur isse kya fayda hai?", "desc": "NCEL Agricultural Exports"},
        {"q": "विश्व की सबसे बड़ी अनाज भंडारण योजना क्या है?", "desc": "World's Largest Grain Storage Plan"},
        {"q": "PACS me Jan Aushadhi Kendra kaise khole?", "desc": "Jan Aushadhi at PACS"},
        {"q": "Sahara refund me kitna paisa milega?", "desc": "Sahara Refund Enhanced 50,000 limit"}
    ]

    for tc in test_cases:
        print(f"\n--- Testing: {tc['desc']} ---")
        try:
            r = requests.post(f"{BASE_URL}/api/chat", json={"query": tc["q"], "lang": "hi"}, timeout=25)
            if r.status_code == 200:
                data = r.json()
                print(f"Status: OK | Source: {data.get('source')} | Lang: {data.get('detected_lang')}")
                reply = data.get('reply') or ''
                print(f"Reply sample:\n{reply[:250]}...")
            else:
                print(f"Failed with status: {r.status_code}, {r.text}")
        except Exception as e:
            print(f"Error testing {tc['desc']}: {e}")

if __name__ == "__main__":
    test_queries()
