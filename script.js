const API_URL = "https://api.mcsrvstat.us/2/now-doc.gl.joinmc.link";

async function fetchStatus() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // Status
    const statusEl = document.getElementById("status");
    if (data.online) {
      statusEl.innerHTML = `<span class="status-dot" style="color:lime;">🟢</span> Online`;
    } else {
      statusEl.innerHTML = `<span class="status-dot" style="color:red;">🔴</span> Offline`;
    }

    // Players
    document.getElementById("players").textContent =
      `Players: ${data.players?.online || 0}/${data.players?.max || "?"}`;

    // Version
    document.getElementById("version").textContent =
      `Version: ${data.version || "Unknown"}`;

    // Online Players List
    const playerListEl = document.getElementById("online-players");
    playerListEl.innerHTML = ""; // clear old list

    if (data.players?.list && data.players.list.length > 0) {
      data.players.list.forEach(player => {
        const li = document.createElement("li");
        li.textContent = player; // player names come from API
        playerListEl.appendChild(li);
      });
    } else {
      playerListEl.innerHTML = `<li>No players online</li>`;
    }
  } catch (err) {
    console.error("Error fetching status:", err);
    document.getElementById("status").innerHTML =
      `<span class="status-dot" style="color:gray;">⚪</span> Error`;
  }
}

// Auto refresh + countdown
let countdown = 60;
setInterval(() => {
  if (countdown <= 0) {
    fetchStatus();
    countdown = 60;
  }
  document.getElementById("timer").textContent = countdown;
  countdown--;
}, 1000);

// Initial fetch
fetchStatus();
