import requests
import json
import sys

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

api_key = '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'
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
