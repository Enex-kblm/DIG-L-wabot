import sys
import json
import ssl
import socket
from datetime import datetime

def ssl_check(domain):
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443)) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                
        expiry_date = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
        days_left = (expiry_date - datetime.now()).days
        
        return {
            "domain": domain,
            "issuer": cert['issuer'][1][0][1],
            "expiry_date": str(expiry_date),
            "days_left": days_left,
            "error": None
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Domain tidak diberikan"}))
        sys.exit(1)
    
    domain = sys.argv[1]
    print(json.dumps(ssl_check(domain)))