require("./config.js");
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
      // ==================== IP SCAN ====================
      case "scan":
        if (!args[0]) return m.reply(`Contoh: ${prefix}scan example.com`);
        
        const pythonScan = spawn("python3", ["python/ip_scanner.py", args[0]]);
        let scanOutput = "";
        
        pythonScan.stdout.on("data", (data) => scanOutput += data.toString());
        pythonScan.stderr.on("data", (err) => console.error(`[SCAN ERROR] ${err}`));
        
        pythonScan.on("close", () => {
          try {
            const result = JSON.parse(scanOutput);
            if (result.error) {
              m.reply(`❌ Error: ${result.error}`);
            } else {
              m.reply(
                `🛡️ *Hasil Scan* 🛡️\n` +
                `Hostname: ${args[0]}\n` +
                `IP: ${result.ip || "-"}\n` +
                `Port Terbuka: ${result.open_ports?.join(", ") || "Tidak ada"}`
              );
            }
          } catch (e) {
            m.reply("❗ Gagal memproses hasil scan");
          }
        });
        break;

      // ==================== DNS LOOKUP ====================
      case "dns":
           if (!args[0]) return m.reply(
                `Contoh penggunaan:\n` +
                `• ${prefix}dns google.com A\n` +
                `• ${prefix}dns example.com AAAA\n` +
                `• ${prefix}dns yahoo.com MX\n` +
                `• ${prefix}dns www.github.com CNAME\n` +
                `• ${prefix}dns microsoft.com TXT\n` +
                `• ${prefix}dns facebook.com NS`
            );
        const recordType = args[1] || "A";
        const pythonDNS = spawn("python3", ["python/dns_lookup.py", args[0], recordType]);
        let dnsOutput = "";
        
        pythonDNS.stdout.on("data", (data) => dnsOutput += data.toString());
        pythonDNS.stderr.on("data", (err) => console.error(`[DNS ERROR] ${err}`));
        
        pythonDNS.on("close", () => {
          try {
            const result = JSON.parse(dnsOutput);
            if (result.error) {
              m.reply(`❌ DNS Error: ${result.error}`);
            } else {
              m.reply(
                `🌐 *DNS Lookup* 🌐\n` +
                `Domain: ${result.domain}\n` +
                `Tipe: ${result.record_type}\n` +
                `Hasil:\n${result.results?.join("\n") || "Tidak ditemukan"}`
              );
            }
          } catch (e) {
            m.reply("❗ Gagal memproses hasil DNS");
          }
        });
        break;

      // ==================== PORT SCAN ====================
      case "portscan":
        if (!args[0]) return m.reply(`Contoh: ${prefix}portscan 8.8.8.8 1-100`);
        
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
              m.reply(`❌ Port Scan Error: ${result.error}`);
            } else {
              let message = `🔦 *Port Scan* 🔦\nIP: ${result.ip}\n\n`;
              result.results?.forEach(p => {
                message += `• Port ${p.port}: ${p.state} (${p.service})\n`;
              });
              m.reply(message || "Tidak ada port terbuka");
            }
          } catch (e) {
            m.reply("❗ Gagal memproses hasil port scan");
          }
        });
        break;

      // ==================== WHOIS LOOKUP ====================
      case "whois":
        if (!args[0]) return m.reply(`Contoh: ${prefix}whois example.com`);
        
        const pythonWhois = spawn("python3", ["python/whois_lookup.py", args[0]]);
        let whoisOutput = "";
        
        pythonWhois.stdout.on("data", (data) => whoisOutput += data.toString());
        pythonWhois.stderr.on("data", (err) => console.error(`[WHOIS ERROR] ${err}`));
        
        pythonWhois.on("close", () => {
          try {
            const result = JSON.parse(whoisOutput);
            if (result.error) {
              m.reply(`❌ WHOIS Error: ${result.error}`);
            } else {
              m.reply(
                `📇 *WHOIS Lookup* 📇\n` +
                `Domain: ${result.domain}\n` +
                `Registrar: ${result.registrar || "-"}\n` +
                `Dibuat: ${result.creation_date || "-"}\n` +
                `Kedaluwarsa: ${result.expiration_date || "-"}\n` +
                `Name Server:\n${result.name_servers?.join("\n") || "-"}`
              );
            }
          } catch (e) {
            m.reply("❗ Gagal memproses hasil WHOIS");
          }
        });
        break;

      // ==================== IP GEOLOCATION ====================
      case "iplocation":
        if (!args[0]) return m.reply(`Contoh: ${prefix}iplocation 8.8.8.8`);
        
        try {
          const ip = args[0];
          const response = await fetch(`http://ip-api.com/json/${ip}`);
          const data = await response.json();
          
          if (data.status === "success") {
            m.reply(
              `🌍 *IP Location* 🌍\n` +
              `IP: ${ip}\n` +
              `Negara: ${data.country} (${data.countryCode})\n` +
              `Kota: ${data.city}\n` +
              `ISP: ${data.isp}\n` +
              `Koordinat: ${data.lat}, ${data.lon}`
            );
          } else {
            m.reply(`❌ Gagal: ${data.message || "Tidak ditemukan"}`);
          }
        } catch (e) {
          m.reply(`❗ Error: ${e.message}`);
        }
        break;

      // ==================== COMMAND OWNER ====================

            default:
                if (budy.startsWith('=>')) {
                    if (!isCreator) return
                    function Return(sul) {
                        sat = JSON.stringify(sul, null, 2)
                        bang = require('util').format(sat)
                        if (sat == undefined) {
                            bang = require('util').format(sul)
                        }
                        return m.reply(bang)
                    }
                    try {
                        m.reply(require('util').format(eval(`(async () => { return ${budy.slice(3)} })()`)))
                    } catch (e) {
                        m.reply(String(e))
                    }
                }

                if (budy.startsWith('>')) {
                    if (!isCreator) return
                    let kode = budy.trim().split(/ +/)[1]
                    let teks
                    try {
                        teks = /await/i.test(kode) ? eval("(async() => { " + kode + " })()") : eval(kode)
                    } catch (e) {
                        teks = e
                    } finally {
                        await m.reply(require('util').format(teks))
                    }
                }

                if (budy.startsWith('$')) {
                    if (!isCreator) return
                    exec(budy.slice(2), (err, stdout) => {
                        if (err) return m.reply(`${err}`)
                        if (stdout) return m.reply(stdout)
                    })
                }
                break;
                break;
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
