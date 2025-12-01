let BACKEND = `${a}`;
const socket = io(BACKEND, { 
    path: "/socket_io_realtime_x9a7b2",
    extraHeaders: { "ngrok-skip-browser-warning": "true" }
});
socket.on("connect", () => console.log("Server Connected:", socket.id));
socket.on("jobLog", data => appendLog(data.text));
socket.on("jobProgress", data => {
    appendLog(`${data.text}`);
    if (data.percent !== undefined) {
        const bar = document.getElementById("acceptProgressBar");
        const wrap = document.getElementById("acceptProgress");
        wrap.style.display = "block";
        bar.style.width = data.percent + "%";
        bar.innerText = Math.floor(data.percent) + "%";
    }
});
socket.on("jobError", data => {
    appendLog("ERROR: " + data.message);
    hideAcceptProgress();
});
socket.on("jobStarted", data => {
    appendLog(`Accept Started: ${data.filename}`);
    showAcceptProgress();
});
socket.on("jobDone", data => {
    appendLog(`✔ Accept Completed: ${data.finalName}`);
    hideAcceptProgress();
});
async function loadApply() {
    const box = document.getElementById("applyList");
    box.innerHTML = "Loading...";
    const res = await fetch(BACKEND + "/api/list_apply_x9a7b2", {
        headers: { "ngrok-skip-browser-warning": "true" }
    });
    const data = await res.json();
    if (!data.ok) {
        box.innerHTML = "Failed To Load Applicants";
        return;
    }
    box.innerHTML = "";
    data.list.forEach(f => {
        const div = document.createElement("div");
        div.className = "file-item";
        div.innerHTML = `
            <b>${f.file}</b> — ${f.humanSize}<br><br>
            <button class="watch-btn" onclick="watchApply('${f.file}')">Watch</button>
            <button class="delete-btn" onclick="deleteApply('${f.file}')">Delete</button>
            <button class="accept-btn" onclick="acceptFile('${f.file}')">Accept</button>
        `;
        box.appendChild(div);
    });
}
function watchApply(filename) {
    const url = BACKEND + "/apply_stream_x9a7b2/" + filename;
    document.getElementById("videoPlayer").src = url;
    document.getElementById("logs").innerText = "";
    document.getElementById("watchPanel").style.display = "flex";
}
function closeWatch() {
    document.getElementById("videoPlayer").pause();
    document.getElementById("videoPlayer").src = "";
    document.getElementById("watchPanel").style.display = "none";
}
async function deleteApply(filename) {
    if (!confirm("Delete " + filename + "?")) return;
    const res = await fetch(BACKEND + "/api/delete_apply_x9a7b2", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ filename })
    });
    const data = await res.json();
    if (data.ok) {
        alert("Deleted.");
        loadApply();
    } else {
        alert("Failed: " + data.message);
    }
}
function acceptFile(filename) {
    const newName = prompt("Enter Name:", filename.replace(".mp4", ""));
    if (!newName) return;
    document.getElementById("logs").innerText = "";
    document.getElementById("watchPanel").style.display = "flex";
    showAcceptProgress();
    appendLog("Accepting");
    socket.emit("acceptApplicant", {
        filename,
        targetName: newName
    });
}
let logCounter = 0;
function appendLog(msg) {
    logCounter++;
    const logs = document.getElementById("logs");
    const line = document.createElement("div");
    line.textContent = msg;
    if (logCounter % 4 === 0) {
        line.style.color = "lime";
    } else {
        line.style.color = "white";
    }
    logs.appendChild(line);
    logs.scrollTop = logs.scrollHeight;
}
function showAcceptProgress() {
    const wrap = document.getElementById("acceptProgress");
    const bar = document.getElementById("acceptProgressBar");
    wrap.style.display = "block";
    bar.style.width = "0%";
    bar.innerText = "0%";
}
function hideAcceptProgress() {
    const wrap = document.getElementById("acceptProgress");
    wrap.style.display = "none";
}
loadApply();