import urllib.request
import json

try:
    req = urllib.request.Request('https://api.optiohire.com/api/job-postings')
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        data = response.read()
        print(data.decode('utf-8')[:500])
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
