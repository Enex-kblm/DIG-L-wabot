import sys
import socket
import json

def scan_ip_and_ports(hostname):
    result = {"ip": None, "open_ports": [], "error": None}

    try:
        ip = socket.gethostbyname(hostname)
        result["ip"] = ip
    except socket.gaierror as e:
        result["error"] = f"gagal menemukan IP: {str(e)}"
        return result
    
    ports = [21, 22, 23, 25, 53, 66, 80, 81, 443, 445, 457, 1080, 1100, 1241, 1352, 1433, 1434, 1521, 1944, 2301, 3000, 3128, 3306, 4000, 4001, 4002, 4100, 5000, 5432, 5800, 5801, 5802, 6346, 6347, 7001, 7002, 8000, 8080, 8443, 8888, 30821]

    for port in ports:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1)
            if s.connect_ex((ip, port)) == 0:
                result["open_ports"].append(port)

    return result

if __name__ == "__main__":
    if len(sys.argv) !=2:
        print(json.dumps({"error": "harap masukan hostname"}))
        sys.exit(1)

    hostname = sys.argv[1]
    result = scan_ip_and_ports(hostname)
    print(json.dumps(result))