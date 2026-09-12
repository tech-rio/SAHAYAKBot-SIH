import requests
import json
import sys
import os

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Load API key from environment or .env file — NEVER hardcode keys
api_key = os.environ.get("NVIDIA_API_KEY", "")
if not api_key:
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                if line.strip().startswith("NVIDIA_API_KEY="):
                    api_key = line.strip().split("=", 1)[1].strip().strip("'\"")
                    break

if not api_key:
    print("ERROR: NVIDIA_API_KEY not found. Set it in .env file or environment variable.")
    sys.exit(1)

url = 'https://integrate.api.nvidia.com/v1/chat/completions'
headers = {'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'}

candidate_models = [
    'deepseek-ai/deepseek-v4-flash-0731',
    'mistralai/mistral-large-2-instruct',
    'google/gemma-3-12b-it',
    'mistralai/mistral-7b-instruct-v0.3'
]

for m in candidate_models:
    try:
        print(f"Testing {m}...")
        payload = {
            'model': m,
            'messages': [
                {'role': 'system', 'content': 'You are SAHAYAKBot, official AI for Ministry of Cooperation. Answer in Hindi concisely.'},
                {'role': 'user', 'content': 'Namaste! PACS kya hota hai?'}
            ],
            'max_tokens': 150
        }
        r = requests.post(url, headers=headers, json=payload, timeout=15)
        print(f"{m} -> status {r.status_code}")
        if r.status_code == 200:
            print("SUCCESS:")
            print(r.json()['choices'][0]['message']['content'])
            break
    except Exception as e:
        print("Error:", e)
