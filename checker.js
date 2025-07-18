const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "internet-check.log");
const hosts = ["8.8.8.8", "1.1.1.1", "google.com", "cloudflare.com"];

function logToFile(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

function pingHost(host) {
  return new Promise((resolve) => {
    exec(`ping -c 3 ${host}`, (error, stdout, stderr) => {
      if (error) {
        resolve({ host, success: false, error: stderr || error.message });
      } else {
        resolve({ host, success: true, output: stdout });
      }
    });
  });
}

async function checkConnection() {
  console.log("🔍 Checking internet connectivity...");

  const results = await Promise.all(hosts.map(pingHost));
  const isConnected = results.some(r => r.success);

  if (isConnected) {
    console.log("🌐 Internet is working.");
  } else {
    console.log("🚫 No internet connection detected.");
    let errorDetails = results.map(r =>
      `Host ${r.host} unreachable. Error: ${r.error || "Unknown"}`
    ).join("\n");
    logToFile(`No internet connection detected.\n${errorDetails}\n`);
  }
}

// Запускаем проверку сразу и затем каждые 60 секунд
checkConnection();
setInterval(checkConnection, 60 * 1000);
