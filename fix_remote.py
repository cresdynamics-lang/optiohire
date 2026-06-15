import paramiko
import time

def run_commands():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print("Connecting...")
        client.connect('49.13.75.61', username='ops', password='Optio1Hire', timeout=15)
        print("Connected.")
        
        commands = [
            # Fix leading space in DATABASE_URL
            "sed -i 's/^ DATABASE_URL/DATABASE_URL/g' /var/www/optiohire/backend/.env",
            "cat /var/www/optiohire/backend/.env | grep DATABASE_URL",
            
            # Pull latest code
            "cd /var/www/optiohire && git pull origin main",
            
            # Rebuild backend and restart
            "cd /var/www/optiohire/backend && npm install && npm run build && pm2 restart all --update-env"
        ]
        
        for cmd in commands:
            print(f"\nRunning: {cmd}")
            stdin, stdout, stderr = client.exec_command(cmd)
            
            # Wait for command to finish
            exit_status = stdout.channel.recv_exit_status()
            
            out = stdout.read().decode().strip()
            err = stderr.read().decode().strip()
            
            if out: print(f"STDOUT:\n{out}")
            if err: print(f"STDERR:\n{err}")
            print(f"Exit status: {exit_status}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    run_commands()
