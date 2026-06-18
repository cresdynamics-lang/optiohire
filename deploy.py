import paramiko

def run_deploy():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print("Connecting to server...")
        client.connect('49.13.75.61', username='ops', password='Optio1Hire', timeout=15)
        print("Connected.")
        
        cmd = """
        cd /var/www/optiohire/backend
        git pull origin main
        npm install --include=dev
        npm run build
        pm2 restart all --update-env
        """
        
        print("Running deploy...")
        stdin, stdout, stderr = client.exec_command(cmd)
        
        out = stdout.read().decode().strip()
        err = stderr.read().decode().strip()
        
        if out: print(f"STDOUT:\n{out}")
        if err: print(f"STDERR:\n{err}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    run_deploy()
