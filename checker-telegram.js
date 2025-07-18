const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const logFile = path.join(__dirname, "internet-check.log");

// === Заполни свой токен и chat_id ниже ===
const TELEGRAM_BOT_TOKEN = "123456789:ABCDEF...";     // <-- вставь свой токен
const TELEGRAM_CHAT_ID = "123456789";                 // <-- вставь свой chat_id

const hosts = [
  "8.8.8.8",
  "1.1.1.1",
  "google.com",
  "cloudflare.com",
  "www.ozon.ru",
  "www.wildberries.ru",
  "ya.ru",
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

async function sendTelegramMessage(text) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: `🛰 Internet check\n${text}`
    });
  } catch (error) {
    console.error("❌ Telegram error:", error.message);
  }
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
  let errorMessages = [];

  for (const result of results) {
    const line = `[${timestamp()}] ${result.host} => ${result.success ? "OK" : "FAIL"}`;
    console.log(line);

    if (!result.success) {
      const errorLine = `${line} | Error: ${result.error}`;
      errorMessages.push(errorLine);
      log(errorLine);
    }

    if (result.success) {
      isConnected = true;
    }
  }

  if (!isConnected) {
    const msg = `[${timestamp()}] No internet connection detected.`;
    console.log("🚫 No internet connection detected.");
    log(msg);
    await sendTelegramMessage(`❌ Нет подключения к интернету.\n${timestamp()}`);
  }
}

// === START лог при запуске
const startLine = `=== START ${timestamp()} ===`;
console.log(startLine);
log(startLine);
sendTelegramMessage(`🟢 Мониторинг запущен: ${timestamp()}`);

// === Запуск проверки
checkConnection();
const interval = setInterval(checkConnection, 60 * 1000);

// === STOP лог при завершении
function handleExit() {
  const stopLine = `=== STOP ${timestamp()} ===`;
  console.log(stopLine);
  log(stopLine);
  sendTelegramMessage(`🛑 Мониторинг остановлен: ${timestamp()}`);
  clearInterval(interval);
  process.exit(0);
}

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);
