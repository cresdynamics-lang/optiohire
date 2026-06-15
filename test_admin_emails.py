import urllib.request
import json

routes = [
    '/api/admin/emails/dead-letter',
    '/api/admin/email-check/missing'
]

for route in routes:
    print(f"\nTesting {route}...")
    try:
        req = urllib.request.Request(f'https://api.optiohire.com{route}')
        with urllib.request.urlopen(req) as response:
            print("Status:", response.status)
            data = response.read()
            print(data.decode('utf-8')[:100])
    except urllib.error.HTTPError as e:
        print(f"HTTPError: {e.code}")
        print(e.read().decode('utf-8')[:100])
    except Exception as e:
        print(f"Error: {e}")
