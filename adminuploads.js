const AUTO_DELETE_MS = 5 * 60 * 1000;
const NGROK_HEADERS = { "ngrok-skip-browser-warning": "true" };

async function fetchFiles() {
    const res = await fetch("http://localhost:4000/admin/files", { headers: NGROK_HEADERS });
    const files = await res.json();
    const tbody = document.querySelector("#fileTable tbody");
    tbody.innerHTML = "";
    files.forEach(f => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${f.number}</td>
            <td>${f.name}</td>
            <td>${formatBytes(f.size)}</td>
            <td>${f.remainingSec}s</td>
            <td>
                <button onclick="downloadFile('${f.name}')">Download</button>
                <button onclick="deleteFile('${f.name}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function deleteFile(filename) {
    if (!confirm(`Delete ${filename}?`)) return;
    const res = await fetch(`http://localhost:4000/admin/files/${encodeURIComponent(filename)}`, {
        method: "DELETE",
        headers: NGROK_HEADERS
    });
    if (res.ok) fetchFiles();
    else alert("Failed To Delete File");
}

function downloadFile(filename) {
    const link = document.createElement("a");
    link.href = `http://localhost:4000/files/${encodeURIComponent(filename)}`;
    link.download = filename;
    link.click();
}

function formatBytes(bytes) {
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
    return bytes.toFixed(1) + " " + units[i];
}

// --- LOCKDOWN TOGGLE ---
document.getElementById("lockdownBtn").addEventListener("click", async () => {
    const res = await fetch("http://localhost:4000/admin/lockdown", {
        method: "POST", // Assuming POST toggles lockdown
        headers: NGROK_HEADERS
    });
    if (res.ok) {
        const state = await res.json(); // assuming {lockdown: true/false}
        alert("Lockdown is now " + (state.lockdown ? "ENABLED" : "DISABLED"));
    } else {
        alert("Failed to toggle lockdown");
    }
});

// --- FETCH LOGS ---
async function fetchLogs() {
    const res = await fetch("http://localhost:4000/admin/logs", { headers: NGROK_HEADERS });
    if (!res.ok) return;
    const logs = await res.text(); // assuming logs are plain text
    document.getElementById("logs").textContent = logs;
}

// --- AUTO REFRESH ---
setInterval(() => {
    fetchFiles();
    fetchLogs();
}, 1000);

// Initial fetch
fetchFiles();
fetchLogs();