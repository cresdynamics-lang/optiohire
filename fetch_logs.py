import paramiko

def fetch_logs():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect('49.13.75.61', username='ops', password='Optio1Hire', timeout=15)
        stdin, stdout, stderr = client.exec_command("pm2 logs optiohire-backend --lines 200 --nostream")
        out = stdout.read()
        with open('remote_logs.txt', 'wb') as f:
            f.write(out)
        print("Logs saved to remote_logs.txt")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    fetch_logs()
