import paramiko

def run_db_fix():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print("Connecting to server...")
        client.connect('49.13.75.61', username='ops', password='Optio1Hire', timeout=15)
        print("Connected.")
        
        sql2 = "ALTER TABLE certificate_approvals DROP CONSTRAINT IF EXISTS certificate_approvals_skill_id_fkey;"
        
        cmd = f"""
        export DATABASE_URL=$(grep '^DATABASE_URL=' /var/www/optiohire/backend/.env | cut -d '=' -f2-)
        psql $DATABASE_URL -c "{sql2}"
        """
        
        print("Running SQL fixes...")
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
    run_db_fix()
