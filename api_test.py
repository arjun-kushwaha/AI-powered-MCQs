import requests
payload = {
 "model": "gemma4:e4b",
 "prompt": "what is FastAPi , expalin in 2 lines",
 "stream": False
}
r = requests.post("http://10.100.60.121:11434/api/generate", json=payload)
print(r.json()["response"])