const SERVER_ADDRESS = "slimoncraft.playminecraft.online";
const API_URL = `https://api.mcsrvstat.us/3/${encodeURIComponent(SERVER_ADDRESS)}`;
const ICON_URL = `https://api.mcsrvstat.us/icon/${encodeURIComponent(SERVER_ADDRESS)}`;
const REFRESH_SECONDS = 60;

const nameEl = document.getElementById("server-name");
const motdEl = document.getElementById("server-motd");
const iconEl = document.getElementById("server-icon");
const infoEl = document.getElementById("server-info");
const playerListEl = document.getElementById("online-players");
const timerEl = document.getElementById("timer");

function addDetail(label, value) {
  if (value === undefined || value === null || value === "") return;

  const row = document.createElement("p");
  const labelEl = document.createElement("strong");
  labelEl.textContent = `${label}: `;
  row.append(labelEl, document.createTextNode(String(value)));
  infoEl.appendChild(row);
}

function getMotd(data) {
  const motd = data.motd?.clean ?? data.motd?.raw;
  if (Array.isArray(motd)) return motd.join(" ").trim();
  return typeof motd === "string" ? motd.trim() : "";
}

function getPlayers(data) {
  const players = data.players?.list ?? [];
  return players.map((player) => typeof player === "string" ? player : player.name).filter(Boolean);
}

function renderStatus(data) {
  const address = data.hostname || data.ip || SERVER_ADDRESS;
  const motd = getMotd(data);
  // The API has no dedicated display-name field, so show its reported hostname
  // as the heading and its server MOTD as the description.
  nameEl.textContent = data.hostname || address;
  motdEl.textContent = motd;
  document.title = `${nameEl.textContent} · Minecraft Server Status`;

  iconEl.src = data.icon || ICON_URL;
  iconEl.hidden = false;

  infoEl.replaceChildren();
  const status = document.createElement("p");
  const statusLabel = document.createElement("strong");
  statusLabel.textContent = "Status: ";
  status.append(statusLabel, document.createTextNode(data.online ? "Online" : "Offline"));
  status.className = data.online ? "is-online" : "is-offline";
  infoEl.appendChild(status);

  if (data.players) {
    addDetail("Players", `${data.players.online ?? 0}/${data.players.max ?? "?"}`);
  }
  addDetail("Address", address);
  addDetail("Port", data.port);
  addDetail("Version", data.version);
  addDetail("Software", data.software);

  playerListEl.replaceChildren();
  const names = getPlayers(data);
  if (names.length) {
    names.forEach((name) => {
      const item = document.createElement("li");
      item.textContent = name;
      playerListEl.appendChild(item);
    });
  } else {
    const item = document.createElement("li");
    item.textContent = data.online ? "No players online" : "Server is offline";
    playerListEl.appendChild(item);
  }
}

async function fetchStatus() {
  try {
    const response = await fetch(API_URL, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Status API returned ${response.status}`);
    renderStatus(await response.json());
  } catch (error) {
    console.error("Could not fetch Minecraft server status:", error);
    nameEl.textContent = SERVER_ADDRESS;
    motdEl.textContent = "Server details are temporarily unavailable.";
    infoEl.replaceChildren();
    const status = document.createElement("p");
    status.className = "is-unknown";
    status.textContent = "Status: unavailable";
    infoEl.appendChild(status);
  }
}

let countdown = REFRESH_SECONDS;
setInterval(() => {
  countdown -= 1;
  if (countdown <= 0) {
    countdown = REFRESH_SECONDS;
    fetchStatus();
  }
  timerEl.textContent = countdown;
}, 1000);

fetchStatus();
