import sys
import whois
import json

def whois_lookup(domain):
    try:
        w = whois.whois(domain)
        return {
            "domain": domain,
            "registrar": w.registrar,
            "creation_date": str(w.creation_date),
            "expiration_date": str(w.expiration_date),
            "name_servers": list(w.name_servers),
            "error": None
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Domain tidak diberikan"}))
        sys.exit(1)
    
    domain = sys.argv[1]
    print(json.dumps(whois_lookup(domain)))