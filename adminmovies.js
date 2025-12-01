let BACKEND = `${a}`;
const socket = io(BACKEND, { 
    path: "/socket_io_realtime_x9a7b2",
    extraHeaders: { "ngrok-skip-browser-warning": "true" }
});
socket.on("connect", () => console.log("Server Connected:", socket.id));
socket.on("jobLog", data => appendLog(data.text));
socket.on("jobProgress", data => appendLog(`${data.text}`));
socket.on("jobError", data => appendLog("ERROR: " + data.message));
socket.on("jobStarted", data => appendLog(`Accept Started: ${data.filename}`));
socket.on("jobDone", data => appendLog(`✔ Accept Completed: ${data.finalName}`));
async function loadApply() {
    const box = document.getElementById("applyList");
    box.innerHTML = "Loading...";
    const res = await fetch(BACKEND + "/api/list_apply_x9a7b2", {
        headers: { 
            "ngrok-skip-browser-warning": "true"
        }
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
    appendLog("Accepting");
    socket.emit("acceptApplicant", {
        filename,
        targetName: newName
    });
}
function appendLog(msg) {
    const logs = document.getElementById("logs");
    logs.innerText += msg + "\n";
    logs.scrollTop = logs.scrollHeight;
}
loadApply();