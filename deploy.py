import paramiko

def run_deploy():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print("Connecting to server...")
        client.connect('49.13.75.61', username='ops', password='Optio1Hire', timeout=15)
        print("Connected.")
        
        cmd = """
        cd /var/www/optiohire
        git pull origin main
        
        echo "Building backend..."
        cd backend
        npm install --include=dev
        npm run build
        
        echo "Building frontend..."
        cd ../frontend
        npm install
        npm run build
        
        echo "Restarting services..."
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
