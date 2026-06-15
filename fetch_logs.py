import paramiko

def run():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('49.13.75.61', username='ops', password='Optio1Hire', timeout=15)
        
        # Check PM2 status
        stdin, stdout, stderr = client.exec_command('pm2 status')
        status = stdout.read().decode('utf-8', 'replace')
        print("PM2 Status:\n", status.encode('ascii', 'replace').decode())
        
        # Print logs
        stdin, stdout, stderr = client.exec_command('pm2 logs --lines 100 --nostream')
        logs = stdout.read().decode('utf-8', 'replace')
        print("PM2 Logs:\n", logs.encode('ascii', 'replace').decode())
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    run()
