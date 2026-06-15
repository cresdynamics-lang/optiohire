import paramiko
import sys

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('49.13.75.61', username='ops', password='Optio1Hire', timeout=10)
    stdin, stdout, stderr = client.exec_command('cat /var/www/optiohire/backend/.env')
    env_content = stdout.read().decode()
    print("STDOUT:\n", env_content)
    print("STDERR:\n", stderr.read().decode())
    
    # Check what routes exist
    stdin, stdout, stderr = client.exec_command('ls -l /var/www/optiohire/backend/src/routes')
    print("ROUTES:\n", stdout.read().decode())
except Exception as e:
    print(f"Error: {e}")
finally:
    client.close()
