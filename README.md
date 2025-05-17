# 🚀 DiG-L-wabot

**DiG-L-wabot** is a powerful and user-friendly WhatsApp bot built using the Baileys library. It operates as a Node.js application and brings a suite of penetration testing and automation tools right to your WhatsApp chat window.

---

## ✨ Features

* **📲 WhatsApp Integration**: Authenticate with WhatsApp through Baileys, enabling the bot to send and receive messages.
* **🌐 Network Scanning**: Execute commands like `ping` and `traceroute` on specified targets.
* **🔍 Port Scanning**: Perform port scans using Nmap to identify open ports on hosts or networks.
* **🧠 Information Gathering**: Collect system or network data, including IP details, DNS records, and WHOIS information.
* **🧩 Extensible Commands**: Easily add new commands or tools by modifying the source code or configuration files.

---

## ⚙️ Installation

Follow the steps below to set up **DiG-L-wabot** locally:

### 📌 Prerequisites

Ensure you have the following installed:

* Node.js (version 14 or later)
* npm (Node package manager)
* Python 3 (if the bot uses Python scripts)

### 📥 Step 1: Clone the Repository

```bash
git clone https://github.com/DiG-L/DiG-L-wabot.git
cd DiG-L-wabot
```

### 📦 Step 2: Install Dependencies

```bash
npm install
```

```bash
pip install -r requirements.txt
```

### 🛠️ Step 3: Configure the Bot

Edit the `config.json` file to adjust preferences such as the bot name and the list of authorized users.

### 🔗 Step 4: Connect to WhatsApp

Start the bot by running:

```bash
node main.js
```

or

```bash
npm start
```

By default, the bot uses a random pairing code (e.g., 0000-0000), which may not work reliably. To switch to QR code authentication, modify the `main.js` file as follows:

Change this block:

```javascript
async function start() {
    const { state, saveCreds } = await useMultiFileAuthState("session")
    const fell = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        browser: ['Mac OS', 'Safari', '10.15.7']
    });
}
```

To this:

```javascript
async function start() {
    const { state, saveCreds } = await useMultiFileAuthState("session")
    const fell = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
        browser: ['Mac OS', 'Safari', '10.15.7']
    });
}
```

### ✅ Step 5: Run and Test

Once connected, the bot should be online. You can verify its functionality by sending commands such as `.menu` or `.help` to it via WhatsApp.

---

## 💬 Usage

Once the bot is active and connected, send commands directly in a WhatsApp chat. For example:

* `.help` – Show a list of available commands
* `.scan 192.168.1.0/24` – Perform a network scan on the specified IP range
* `.portscan example.com` – Conduct a port scan on the target domain

You can customize or extend the bot by editing the source code or adding your own scripts.

---

## 👥 Authors

* [@NCTea](https://github.com/NCTea)
* [@FeliceSama](https://github.com/FeliceSama)
* [@Enex-kblm](https://github.com/Enex-kblm)

---

## 🙌 Acknowledgments

* **Baileys** – For the WhatsApp Web API library powering the bot
* **Node.js Community** – And contributors of the open-source libraries used in this project
* **All Contributors** – Who inspired and contributed to the DiG-L-wabot project

---

## ⚠️ Disclaimer

DiG-L-wabot is a personal and hobby project provided without any warranties. Use it at your own risk. If you encounter bugs or issues, feel free to fix them yourself or contribute improvements through pull requests on the repository.

---

✨ *Happy Pentesting with DiG-L-wabot!*
