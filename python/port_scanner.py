import sys
import nmap
import json

def port_scan(ip, ports='1-1000'):
    try:
        scanner = nmap.PortScanner()
        scanner.scan(ip, ports, arguments='-T4')
        results = []
        for host in scanner.all_hosts():
            for proto in scanner[host].all_protocols():
                ports = scanner[host][proto].keys()
                for port in ports:
                    results.append({
                        "port": port,
                        "state": scanner[host][proto][port]['state'],
                        "service": scanner[host][proto][port]['name']
                    })
        return {"ip": ip, "results": results, "error": None}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "IP tidak diberikan"}))
        sys.exit(1)
    
    ip = sys.argv[1]
    ports = sys.argv[2] if len(sys.argv) > 2 else '1-1000'
    print(json.dumps(port_scan(ip, ports)))