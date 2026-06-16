import os

directory = r'c:\Users\Maxkryie Networks\Desktop\optiohire\frontend'
api_dir = os.path.join(directory, 'src', 'app', 'api')

count = 0
for root, dirs, files in os.walk(api_dir):
    for file in files:
        if file == 'route.ts':
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace process.env logic with hardcoded URL
            new_content = content.replace("process.env.BACKEND_URL || 'https://api.optiohire.com'", "'https://api.optiohire.com'")
            new_content = new_content.replace('process.env.BACKEND_URL || "https://api.optiohire.com"', "'https://api.optiohire.com'")
            
            if content != new_content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1

print(f"Updated {count} route.ts files")

# Also update next.config.js
config_path = os.path.join(directory, 'next.config.js')
with open(config_path, 'r', encoding='utf-8') as f:
    config_content = f.read()

new_config = config_content.replace("process.env.BACKEND_URL || 'https://api.optiohire.com'", "'https://api.optiohire.com'")
new_config = new_config.replace('process.env.BACKEND_URL || "https://api.optiohire.com"', "'https://api.optiohire.com'")

if new_config != config_content:
    with open(config_path, 'w', encoding='utf-8') as f:
        f.write(new_config)
    print("Updated next.config.js")

