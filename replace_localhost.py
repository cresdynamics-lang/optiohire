import os
import re

target_dir = r"c:\Users\Maxkryie Networks\Desktop\optiohire\frontend"

pattern = re.compile(r'http://(?:localhost|127\.0\.0\.1):3001')
replacement = 'https://api.optiohire.com'

count = 0
for root, dirs, files in os.walk(target_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js')):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if pattern.search(content):
                    new_content = pattern.sub(replacement, content)
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    count += 1
            except Exception as e:
                pass

print(f"Replaced in {count} files.")
