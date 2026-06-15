import paramiko
import sys

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting...")
    client.connect('49.13.75.61', username='ops', password='Optio1Hire', timeout=15)
    print("Connected.\n")

    commands = [
        "cd /var/www/optiohire && git log -1 --oneline",
        "pm2 status"
    ]

    for cmd in commands:
        print(f"Running: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        exit_status = stdout.channel.recv_exit_status()
        out = stdout.read().decode('utf-8', errors='ignore').strip()
        err = stderr.read().decode('utf-8', errors='ignore').strip()
        
        if out: print("STDOUT:\n" + out)
        if err: print("STDERR:\n" + err)
        print(f"Exit status: {exit_status}\n")

    client.close()
except Exception as e:
    print(f"Error: {e}")
