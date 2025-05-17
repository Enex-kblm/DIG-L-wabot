import sys
import dns.resolver
import json
from dns.rdatatype import RdataType

def dns_lookup(domain, record_type='A'):
    try:
        # Konversi record_type ke uppercase dan validasi
        record_type = record_type.upper()
        
        # Resolve DNS
        answers = dns.resolver.resolve(domain, record_type)
        
        # Format hasil sesuai tipe record
        results = []
        for rdata in answers:
            if record_type == 'MX':
                results.append(f"{rdata.preference} {rdata.exchange}")
            elif record_type == 'SOA':
                soa_data = (
                    f"{rdata.mname} {rdata.rname} "
                    f"{rdata.serial} {rdata.refresh} "
                    f"{rdata.retry} {rdata.expire} {rdata.minimum}"
                )
                results.append(soa_data)
            else:
                results.append(str(rdata))
        
        return {
            "domain": domain,
            "record_type": record_type,
            "results": results,
            "error": None
        }
        
    except dns.resolver.NoAnswer:
        return {"error": f"Tidak ada record {record_type} untuk domain ini"}
    except dns.resolver.NXDOMAIN:
        return {"error": "Domain tidak ditemukan"}
    except dns.resolver.NoNameservers:
        return {"error": "Tidak ada nameserver yang merespons"}
    except dns.rdatatype.UnknownRdatatype:
        return {"error": f"Tipe record {record_type} tidak valid"}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Domain tidak diberikan"}))
        sys.exit(1)
    
    domain = sys.argv[1]
    record_type = sys.argv[2] if len(sys.argv) > 2 else 'A'
    
    print(json.dumps(dns_lookup(domain, record_type)))