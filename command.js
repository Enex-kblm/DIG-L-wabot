const { getSettings, setLanguage } = require("./config");
const fs = require("fs");
const { getGroupAdmins } = require("./lib/library.js");
const { exec, spawn } = require("child_process");

module.exports = async (fell, m) => {
    try {
        const body = (
            (m.mtype === 'conversation' && m.message.conversation) ||
            (m.mtype === 'imageMessage' && m.message.imageMessage.caption) ||
            (m.mtype === 'documentMessage' && m.message.documentMessage.caption) ||
            (m.mtype === 'videoMessage' && m.message.videoMessage.caption) ||
            (m.mtype === 'extendedTextMessage' && m.message.extendedTextMessage.text) ||
            (m.mtype === 'buttonsResponseMessage' && m.message.buttonsResponseMessage.selectedButtonId) ||
            (m.mtype === 'templateButtonReplyMessage' && m.message.templateButtonReplyMessage.selectedId)
        ) ? (
            (m.mtype === 'conversation' && m.message.conversation) ||
            (m.mtype === 'imageMessage' && m.message.imageMessage.caption) ||
            (m.mtype === 'documentMessage' && m.message.documentMessage.caption) ||
            (m.mtype === 'videoMessage' && m.message.videoMessage.caption) ||
            (m.mtype === 'extendedTextMessage' && m.message.extendedTextMessage.text) ||
            (m.mtype === 'buttonsResponseMessage' && m.message.buttonsResponseMessage.selectedButtonId) ||
            (m.mtype === 'templateButtonReplyMessage' && m.message.templateButtonReplyMessage.selectedId)
        ) : '';

        const budy = (typeof m.text === 'string') ? m.text : '';
        const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤ΠΦ_&><`™©®Δ^βα~¦|/\\©^]/;
        const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : '.';
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1)
        const text = q = args.join(" ")
        const sender = m.key.fromMe ? (fell.user.id.split(':')[0] + '@s.whatsapp.net' || fell.user.id) : (m.key.participant || m.key.remoteJid)
        const botNumber = await fell.decodeJid(fell.user.id)
        const senderNumber = sender.split('@')[0]
        const pushname = m.pushName || `${senderNumber}`
        const isBot = botNumber.includes(senderNumber)
        const fatkuns = (m.quoted || m)
        const quoted = (fatkuns.mtype == 'buttonsMessage') ? fatkuns[Object.keys(fatkuns)[1]] : (fatkuns.mtype == 'templateMessage') ? fatkuns.hydratedTemplate[Object.keys(fatkuns.hydratedTemplate)[1]] : (fatkuns.mtype == 'product') ? fatkuns[Object.keys(fatkuns)[0]] : m.quoted ? m.quoted : m
        const mime = (quoted.m || quoted).mimetype || ''
        const qmsg = (quoted.m || quoted)
        const isCreator = (m && m.sender && [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)) || false;

        const groupMetadata = m.isGroup ? await fell.groupMetadata(m.chat).catch(e => { }) : ''
        const groupName = m.isGroup ? groupMetadata.subject : ''
        const participants = m.isGroup ? await groupMetadata.participants : ''
        const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : ''
        const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
        const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
        const groupOwner = m.isGroup ? groupMetadata.owner : ''
        const isGroupOwner = m.isGroup ? (groupOwner ? groupOwner : groupAdmins).includes(m.sender) : false

        if (isCmd) console.log("~> [CMD]", command, "from", pushname, "in", m.isGroup ? "Group Chat" : "Private Chat", '[' + args.length + ']');

    switch (command) {

// ==================== MENU & HELP ====================
case "menu":
case "help": {
    const lang = getSettings().language;

    if (lang === "en") {
        m.reply(
            `🛠️ *Bot Feature Menu*:\n` +
            `• ${prefix}scan <domain>\n` +
            `• ${prefix}dns <domain> [ A | AAAA | MX | TXT | CNAME | NS ]\n` +
            `• ${prefix}portscan <ip> [range]\n` +
            `• ${prefix}whois <domain>\n` +
            `• ${prefix}iplocation <ip>\n` +
            `• ${prefix}vulnscan <url>\n` +
            `• ${prefix}sslinfo <domain>\n` + 
            `• ${prefix}language`
        );
    } else {
        m.reply(
            `🛠️ *Menu Fitur Bot*:\n` +
            `• ${prefix}scan <domain>\n` +
            `• ${prefix}dns <domain> [ A | AAAA | MX | TXT | CNAME | NS ]\n` +
            `• ${prefix}portscan <ip> [range]\n` +
            `• ${prefix}whois <domain>\n` +
            `• ${prefix}iplocation <ip>\n` +
            `• ${prefix}vulnscan <url>\n` +
            `• ${prefix}sslinfo <domain>\n` +
            `• ${prefix}bahasa`
        );
    }
    break;
}

// ==================== IP SCAN ====================
case "scan": {
    if (!args[0]) {
        const lang = getSettings().language;
        return m.reply(
            lang === "en"
                ? `Example: ${prefix}scan example.com`
                : `Contoh: ${prefix}scan example.com`
        );
    }

    const pythonScan = spawn("python3", ["python/ip_scanner.py", args[0]]);
    let scanOutput = "";

    pythonScan.stdout.on("data", (data) => scanOutput += data.toString());
    pythonScan.stderr.on("data", (err) => console.error(`[SCAN ERROR] ${err}`));

    pythonScan.on("close", () => {
        const lang = getSettings().language;

        try {
            const result = JSON.parse(scanOutput);
            if (result.error) {
                return m.reply(`❌ ${lang === "en" ? "Error" : "Kesalahan"}: ${result.error}`);
            }

            m.reply(
                (lang === "en"
                    ? `🛡️ *Scan Result* 🛡️\n`
                    : `🛡️ *Hasil Scan* 🛡️\n`) +
                `Hostname: ${args[0]}\n` +
                `IP: ${result.ip || "-"}\n` +
                `${lang === "en" ? "Open Ports" : "Port Terbuka"}: ${result.open_ports?.join(", ") || (lang === "en" ? "None" : "Tidak ada")}`
            );
        } catch (e) {
            m.reply(lang === "en" ? "❗ Failed to process scan result" : "❗ Gagal memproses hasil scan");
        }
    });
    break;
}

// ==================== DNS LOOKUP ====================
case "dns": {
    const lang = getSettings().language;
    if (!args[0]) {
        return m.reply(
            lang === "en"
                ? `Example: ${prefix}dns google.com A\n` +
                  `• ${prefix}dns example.com AAAA\n` +
                  `• ${prefix}dns yahoo.com MX\n` +
                  `• ${prefix}dns www.github.com CNAME\n` +
                  `• ${prefix}dns microsoft.com TXT\n` +
                  `• ${prefix}dns facebook.com NS`
                : `Contoh penggunaan:\n` +
                  `• ${prefix}dns google.com A\n` +
                  `• ${prefix}dns example.com AAAA\n` +
                  `• ${prefix}dns yahoo.com MX\n` +
                  `• ${prefix}dns www.github.com CNAME\n` +
                  `• ${prefix}dns microsoft.com TXT\n` +
                  `• ${prefix}dns facebook.com NS`
        );
    }

    const recordType = args[1] || "A";
    const pythonDNS = spawn("python3", ["python/dns_lookup.py", args[0], recordType]);
    let dnsOutput = "";

    pythonDNS.stdout.on("data", (data) => dnsOutput += data.toString());
    pythonDNS.stderr.on("data", (err) => console.error(`[DNS ERROR] ${err}`));

    pythonDNS.on("close", () => {
        try {
            const result = JSON.parse(dnsOutput);
            if (result.error) {
                m.reply(lang === "en" ? `❌ DNS Error: ${result.error}` : `❌ Error DNS: ${result.error}`);
            } else {
                m.reply(
                    (lang === "en"
                        ? `🌐 *DNS Lookup* 🌐\nDomain: ${result.domain}\nType: ${result.record_type}\nResult:\n`
                        : `🌐 *DNS Lookup* 🌐\nDomain: ${result.domain}\nTipe: ${result.record_type}\nHasil:\n`) +
                    (result.results?.join("\n") || (lang === "en" ? "Not found" : "Tidak ditemukan"))
                );
            }
        } catch (e) {
            m.reply(lang === "en" ? "❗ Failed to process DNS result" : "❗ Gagal memproses hasil DNS");
        }
    });
    break;
}

// ==================== PORT SCAN ====================
case "portscan": {
    const lang = getSettings().language;
    if (!args[0]) {
        return m.reply(
            lang === "en"
                ? `Example: ${prefix}portscan 8.8.8.8 1-100`
                : `Contoh: ${prefix}portscan 8.8.8.8 1-100`
        );
    }

    const targetIP = args[0];
    const ports = args[1] || "1-1000";
    const pythonPort = spawn("python3", ["python/port_scanner.py", targetIP, ports]);
    let portOutput = "";

    pythonPort.stdout.on("data", (data) => portOutput += data.toString());
    pythonPort.stderr.on("data", (err) => console.error(`[PORT ERROR] ${err}`));

    pythonPort.on("close", () => {
        try {
            const result = JSON.parse(portOutput);
            if (result.error) {
                m.reply(
                    lang === "en"
                        ? `❌ Port Scan Error: ${result.error}`
                        : `❌ Kesalahan Pemindaian Port: ${result.error}`
                );
            } else {
                let message = 
                    lang === "en"
                        ? `🔦 *Port Scan* 🔦\nIP: ${result.ip}\n\n`
                        : `🔦 *Pemindaian Port* 🔦\nIP: ${result.ip}\n\n`;

                result.results?.forEach(p => {
                    message += lang === "en"
                        ? `• Port ${p.port}: ${p.state} (${p.service})\n`
                        : `• Port ${p.port}: ${p.state} (${p.service})\n`;
                });
                m.reply(message || (lang === "en" ? "No open ports" : "Tidak ada port terbuka"));
            }
        } catch (e) {
            m.reply(
                lang === "en"
                    ? "❗ Failed to process port scan result"
                    : "❗ Gagal memproses hasil pemindaian port"
            );
        }
    });
    break;
}

// ==================== WHOIS LOOKUP ====================
case "whois": {
    const lang = getSettings().language;
    if (!args[0]) {
        return m.reply(
            lang === "en"
                ? `Example: ${prefix}whois example.com`
                : `Contoh: ${prefix}whois example.com`
        );
    }

    const pythonWhois = spawn("python3", ["python/whois_lookup.py", args[0]]);
    let whoisOutput = "";

    pythonWhois.stdout.on("data", (data) => whoisOutput += data.toString());
    pythonWhois.stderr.on("data", (err) => console.error(`[WHOIS ERROR] ${err}`));

    pythonWhois.on("close", () => {
        try {
            const result = JSON.parse(whoisOutput);
            if (result.error) {
                m.reply(
                    lang === "en"
                        ? `❌ WHOIS Error: ${result.error}`
                        : `❌ Kesalahan WHOIS: ${result.error}`
                );
            } else {
                m.reply(
                    lang === "en"
                        ? `📇 *WHOIS Lookup* 📇\n` +
                          `Domain: ${result.domain}\n` +
                          `Registrar: ${result.registrar || "-"}\n` +
                          `Created: ${result.creation_date || "-"}\n` +
                          `Expires: ${result.expiration_date || "-"}\n` +
                          `Name Servers:\n${result.name_servers?.join("\n") || "-"}`
                        : `📇 *Pencarian WHOIS* 📇\n` +
                          `Domain: ${result.domain}\n` +
                          `Registrar: ${result.registrar || "-"}\n` +
                          `Dibuat: ${result.creation_date || "-"}\n` +
                          `Kedaluwarsa: ${result.expiration_date || "-"}\n` +
                          `Name Servers:\n${result.name_servers?.join("\n") || "-"}`
                );
            }
        } catch (e) {
            m.reply(
                lang === "en"
                    ? "❗ Failed to process WHOIS result"
                    : "❗ Gagal memproses hasil WHOIS"
            );
        }
    });
    break;
}

// ==================== IP GEOLOCATION ====================
case "iplocation": {
    const lang = getSettings().language;
    if (!args[0]) {
        return m.reply(
            lang === "en"
                ? `Example: ${prefix}iplocation 8.8.8.8`
                : `Contoh: ${prefix}iplocation 8.8.8.8`
        );
    }

    try {
        const ip = args[0];
        const response = await fetch(`http://ip-api.com/json/${ip}`);
        const data = await response.json();

        if (data.status === "success") {
            m.reply(
                lang === "en"
                    ? `🌍 *IP Location* 🌍\n` +
                      `IP: ${ip}\n` +
                      `Country: ${data.country} (${data.countryCode})\n` +
                      `City: ${data.city}\n` +
                      `ISP: ${data.isp}\n` +
                      `Coordinates: ${data.lat}, ${data.lon}`
                    : `🌍 *Lokasi IP* 🌍\n` +
                      `IP: ${ip}\n` +
                      `Negara: ${data.country} (${data.countryCode})\n` +
                      `Kota: ${data.city}\n` +
                      `ISP: ${data.isp}\n` +
                      `Koordinat: ${data.lat}, ${data.lon}`
            );
        } else {
            m.reply(
                lang === "en"
                    ? `❌ Failed: ${data.message || "Not found"}`
                    : `❌ Gagal: ${data.message || "Tidak ditemukan"}`
            );
        }
    } catch (e) {
        m.reply(
            lang === "en"
                ? `❗ Error: ${e.message}`
                : `❗ Error: ${e.message}`
        );
    }
    break;
}

// ==================== VULNERABILITY SCAN ====================
case "vulnscan": {
    const langVuln = getSettings().language;
    if (!args[0]) {
        return m.reply(
            langVuln === "en"
                ? `Example: ${prefix}vulnscan https://example.com`
                : `Contoh: ${prefix}vulnscan https://example.com`
        );
    }

    const pythonVuln = spawn("python3", ["python/vulnerability_scan.py", args[0]]);
    let vulnOutput = "";

    pythonVuln.stdout.on("data", (data) => vulnOutput += data.toString());
    pythonVuln.stderr.on("data", (err) => console.error(`[VULN ERROR] ${err}`));

    pythonVuln.on("close", () => {
        try {
            const result = JSON.parse(vulnOutput);
            if (result.error) {
                m.reply(
                    langVuln === "en"
                        ? `❌ Error: ${result.error}`
                        : `❌ Error: ${result.error}`
                );
            } else {
                let message = 
                    langVuln === "en" 
                    ? `🛡️ *Vulnerability Scan* 🛡️\nURL: ${result.url}\n\n` 
                    : `🛡️ *Pemeriksaan Kerentanannya* 🛡️\nURL: ${result.url}\n\n`;

                if (result.vulnerabilities.csrf_missing?.length > 0) {
                    message += 
                        langVuln === "en"
                        ? `⚠️ *Missing CSRF Forms*:\n${result.vulnerabilities.csrf_missing.join('\n')}`
                        : `⚠️ *Form Rentan CSRF*:\n${result.vulnerabilities.csrf_missing.join('\n')}`;
                } else {
                    message += 
                        langVuln === "en"
                        ? `No CSRF vulnerabilities found.`
                        : `Tidak ditemukan kerentanan CSRF.`;
                }
                m.reply(message);
            }
        } catch (e) {
            m.reply(
                langVuln === "en"
                    ? "❗ Failed to process scan results"
                    : "❗ Gagal memproses hasil scan"
            );
        }
    });
    break;
}

// ==================== SSL CHECKER ====================
case "sslinfo": {
    const langSSL = getSettings().language;
    if (!args[0]) {
        return m.reply(
            langSSL === "en"
                ? `Example: ${prefix}sslinfo example.com`
                : `Contoh: ${prefix}sslinfo example.com`
        );
    }

    const pythonSSL = spawn("python3", ["python/ssl_checker.py", args[0]]);
    let sslOutput = "";

    pythonSSL.stdout.on("data", (data) => sslOutput += data.toString());
    pythonSSL.stderr.on("data", (err) => console.error(`[SSL ERROR] ${err}`));

    pythonSSL.on("close", () => {
        try {
            const result = JSON.parse(sslOutput);
            if (result.error) {
                m.reply(
                    langSSL === "en"
                        ? `❌ Error: ${result.error}`
                        : `❌ Error: ${result.error}`
                );
            } else {
                m.reply(
                    langSSL === "en"
                        ? `🔒 *SSL Info* 🔒\n` +
                          `Domain: ${result.domain}\n` +
                          `Issuer: ${result.issuer}\n` +
                          `Expiry Date: ${result.expiry_date}\n` +
                          `Days Left: ${result.days_left} days`
                        : `🔒 *Info SSL* 🔒\n` +
                          `Domain: ${result.domain}\n` +
                          `Issuer: ${result.issuer}\n` +
                          `Kedaluwarsa: ${result.expiry_date}\n` +
                          `Sisa Hari: ${result.days_left} hari`
                );
            }
        } catch (e) {
            m.reply(
                langSSL === "en"
                    ? "❗ Failed to process SSL information"
                    : "❗ Gagal memproses info SSL"
            );
        }
    });
    break;
}

// ==================== LANGUAGE SETTINGS ====================
case "en": {
    setLanguage("en");
    m.reply("✅ Language has been changed to English.");
    break;
}

case "id": {
    setLanguage("id");
    m.reply("✅ Bahasa telah diubah ke Bahasa Indonesia.");
    break;
}

case "language":
case "bahasa": {
    const lang = getSettings().language;
    m.reply(
        lang === "en" 
            ? `🌐 *Language List*:\n` +
              `• ${prefix}id - Indonesian\n` +
              `• ${prefix}en - English`
            : `🌐 *Daftar Bahasa*:\n` +
              `• ${prefix}id - Bahasa Indonesia\n` +
              `• ${prefix}en - Bahasa Inggris`
    );
    break;
}

// ==================== DEFAULT HANDLER ====================
default: {
    if (budy.startsWith('=>')) {
        if (!isCreator) return;
        function Return(sul) {
            sat = JSON.stringify(sul, null, 2);
            bang = require('util').format(sat);
            if (sat == undefined) {
                bang = require('util').format(sul);
            }
            return m.reply(bang);
        }
        try {
            m.reply(require('util').format(eval(`(async () => { return ${budy.slice(3)} })()`)));
        } catch (e) {
            m.reply(String(e));
        }
    }

    if (budy.startsWith('>')) {
        if (!isCreator) return;
        let kode = budy.trim().split(/ +/)[1];
        let teks;
        try {
            teks = /await/i.test(kode) ? eval("(async() => { " + kode + " })()") : eval(kode);
        } catch (e) {
            teks = e;
        } finally {
            await m.reply(require('util').format(teks));
        }
    }

    if (budy.startsWith('$')) {
        if (!isCreator) return;
        exec(budy.slice(2), (err, stdout) => {
            if (err) return m.reply(`${err}`);
            if (stdout) return m.reply(stdout);
        });
    }
    break;
}

    }
    } catch (err) {
        console.log(require('util').format(err));
    }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(`Update ${__filename}`);
    delete require.cache[file];
    require(file);
});