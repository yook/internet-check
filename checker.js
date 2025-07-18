const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "internet-check.log");

const hosts = [
  "8.8.8.8",
  "1.1.1.1",
  "google.com",
  "cloudflare.com",
  "www.ozon.ru",
  "www.wildberries.ru",
  "ya.ru",
  "149.154.167.99",    // Telegram
  "157.240.221.60"     // WhatsApp
];

function timestamp() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  return `${date} ${time}`;
}

function log(message) {
  fs.appendFileSync(logFile, `${message}\n`);
}

function pingHost(host) {
  return new Promise((resolve) => {
    exec(`ping -c 3 ${host}`, (error, stdout, stderr) => {
      if (error) {
        resolve({ host, success: false, error: stderr || error.message });
      } else {
        resolve({ host, success: true });
      }
    });
  });
}

async function checkConnection() {
  const results = await Promise.all(hosts.map(pingHost));

  let isConnected = false;

  for (const result of results) {
    const line = `[${timestamp()}] ${result.host} => ${result.success ? "OK" : "FAIL"}`;
    console.log(line);

    if (!result.success) {
      log(`${line} | Error: ${result.error}`);
    }

    if (result.success) {
      isConnected = true;
    }
  }

  if (!isConnected) {
    const msg = `[${timestamp()}] No internet connection detected.`;
    console.log("🚫 No internet connection detected.");
    log(msg);
  } else {
    console.log("🌐 Internet seems to be working.");
  }
}

// ===== START log at launch =====
const startLine = `=== START ${timestamp()} ===`;
console.log(startLine);
log(startLine);

// ===== Run checker =====
checkConnection();
const interval = setInterval(checkConnection, 60 * 1000);

// ===== STOP log on termination =====
function handleExit() {
  const stopLine = `=== STOP ${timestamp()} ===`;
  console.log(stopLine);
  log(stopLine);
  clearInterval(interval);
  process.exit(0);
}

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);
